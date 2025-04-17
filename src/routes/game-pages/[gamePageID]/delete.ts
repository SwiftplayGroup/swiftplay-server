import { Request, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import authenticator from "#utils/authenticator.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";

const deleteGamePageRouter = Router({ mergeParams: true });

deleteGamePageRouter.delete("/", authenticator);
deleteGamePageRouter.delete("/", async (request: Request<{ gamePageID: string }>, response: AuthenticatedResponse) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { user } = response.locals;
  user.verifyPermission("gamePages.delete", 1);

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

    // Delete associated runs.
    await database.collection("runs").deleteMany({
      gamePageID: gamePage._id
    });

    // Delete the game page from the records.
    await gamePagesCollection.deleteOne({
      _id: gamePage._id
    });

    await addToAuditLog("gamePages.delete", user._id, gamePage._id, user.getSessionID());

  } catch (error: unknown) {

    console.warn(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
    return;

  }

  response.status(204).json({
    success: true
  });

});

export default deleteGamePageRouter;
