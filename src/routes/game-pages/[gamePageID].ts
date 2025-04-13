import { Request, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import authenticator, { defaultPermissions } from "#utils/authenticator.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import categoriesRouter from "./[gamePageID]/categories.js"

const router = Router({ mergeParams: true });

router.get("/", async (request: Request<{ gamePageID: string }>, response) => {
  // Verify that the user provides a valid game page ID. If anyone is invalid, return a 404 error.
  let objectID;
  try {
    objectID = new ObjectId(request.params.gamePageID);
  } catch (error: unknown) {
    console.log(error);
    return response.status(404).json({
      message: "Game page not found.",
    });
  }

  const document = await database.collection("gamePages").findOne({
    _id: objectID,
  });

  if (!document) {
    return response.status(404).json({
      message: "Game page not found.",
    });
  }

  // Rename sensitive keys.
  const page: { [key: string]: unknown } = {};
  for (const key of Object.keys(document)) {
    let newKey = key;
    if (newKey === "_id") {
      newKey = "id";
    }

    page[newKey] = document[key];
  }

  return response.json(page);
});

// Edit a game page.
router.patch("/", authenticator);
router.patch("/", async (request: Request<{ gamePageID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.edit === false || (!defaultPermissions.gamePages.edit && !permissionOverwrites?.gamePages?.edit)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  // Verify properties.
  for (const key of Object.keys(request.body)) {

    const keyChecks: {[key: string]: (value: unknown) => boolean | string} = {
      name: (value: unknown) => (
        typeof(value) !== "string" ? "Name must be a string." : (
          value.length > 128 || value.length < 1 ? "Name must be between 1 to 128 characters." : true
        )
      )
    };

    const keyCheck = keyChecks[key];
    if (!keyCheck) {

      return response.status(400).json({
        message: `${key} is an invalid property.`
      });

    }
    
    const responseMessage = keyCheck(request.body[key]);
    if (typeof(responseMessage) !== "boolean") {

      return response.status(400).json({
        message: responseMessage
      });

    }

  }

  let gamePage;
  let gamePagesCollection = database.collection("gamePages");

  try {
    
    const gamePageID = new ObjectId(request.params.gamePageID);
    gamePage = await gamePagesCollection.findOne({
      _id: new ObjectId(gamePageID)
    });

    if (!gamePage) {

      return response.status(404).json({
        message: "Game page not found.",
      });

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      return response.status(404).json({
        message: "Game page not found.",
      });

    } else {

      console.log(error);

      return response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }
    
  }

  try {

    await gamePagesCollection.updateOne(
      {_id: gamePage._id},
      {
        $set: request.body
      }
    );

    await addToAuditLog("gamePages.edit", actorID, gamePage._id, response.locals.sessionID)

  } catch (error: unknown) {

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

  }

  return response.status(200).json({
    success: true
  })

});

// Delete a game page.
router.delete("/", authenticator);
router.delete("/", async (request: Request<{ gamePageID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.delete === false || (!defaultPermissions.gamePages.delete && !permissionOverwrites?.gamePages?.delete)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  let gamePage;
  let gamePagesCollection = database.collection("gamePages");

  try {
    
    const gamePageID = new ObjectId(request.params.gamePageID);
    gamePage = await gamePagesCollection.findOne({
      _id: new ObjectId(gamePageID)
    });

    if (!gamePage) {

      return response.status(404).json({
        message: "Game page not found.",
      });

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      return response.status(404).json({
        message: "Game page not found.",
      });

    } else {

      console.log(error);

      return response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }
    
  }

  try {

    // Delete associated runs.
    await database.collection("runs").deleteMany({
      gamePageID: gamePage._id
    });

    // Delete the game page from the records.
    await gamePagesCollection.deleteOne({
      _id: gamePage._id
    });

    await addToAuditLog("gamePages.delete", actorID, gamePage._id, response.locals.sessionID);

  } catch (error: unknown) {

    console.warn(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

  }

  return response.status(204).json({
    success: true
  })

});

router.use("/categories", categoriesRouter);

export default router;
