import { Request, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import authenticator, { defaultPermissions } from "#utils/authenticator.js";

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

// Delete a game page.
router.delete("/", authenticator);
router.delete("/", async (request: Request<{ gamePageID: string }>, response) => {

  // Verify permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.delete === false || (!defaultPermissions.gamePages.delete && !permissionOverwrites?.gamePages?.delete)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  let gamePage;

  try {
    
    const gamePageID = new ObjectId(request.params.gamePageID);
    gamePage = await database.collection("gamePages").findOne({
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

  return response.status(204).json({
    success: true
  })

});

export default router;
