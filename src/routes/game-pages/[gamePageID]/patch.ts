import { Request, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import authenticator from "#utils/authenticator.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";

const editGamePageRouter = Router({ mergeParams: true });

editGamePageRouter.patch("/", authenticator);
editGamePageRouter.patch("/", async (request: Request<{ gamePageID: string }>, response: AuthenticatedResponse) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { user } = response.locals;
  user.verifyPermission("gamePages.edit", 1);

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

      response.status(400).json({
        message: `${key} is an invalid property.`
      });
      return;

    }
    
    const responseMessage = keyCheck(request.body[key]);
    if (typeof(responseMessage) !== "boolean") {

      response.status(400).json({
        message: responseMessage
      });
      return;

    }

  }

  let gamePage;
  const gamePagesCollection = database.collection("gamePages");

  try {
    
    const gamePageID = new ObjectId(request.params.gamePageID);
    gamePage = await gamePagesCollection.findOne({
      _id: new ObjectId(gamePageID)
    });

    if (!gamePage) {

      response.status(404).json({
        message: "Game page not found.",
      });
      return;

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      response.status(404).json({
        message: "Game page not found.",
      });

    } else {

      console.log(error);

      response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }

    return;
    
  }

  try {

    await gamePagesCollection.updateOne(
      {_id: gamePage._id},
      {
        $set: request.body
      }
    );

    await addToAuditLog("gamePages.edit", user._id, gamePage._id, user.getSessionID());

  } catch (error: unknown) {

    console.warn(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

    return;

  }

  response.status(200).json({
    success: true
  });

});

export default editGamePageRouter;
