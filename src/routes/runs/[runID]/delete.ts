import { Router, Request } from "express";
import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import authenticator from "#utils/authenticator.js";

const deleteRunRouter = Router({ mergeParams: true });

deleteRunRouter.delete("/", authenticator);
deleteRunRouter.delete("/", async (request: Request<{ gamePageID: string; runID: string }>, response) => {

  // Confirm that the run ID is valid.
  let runID;
  let gamePageID;

  try {

    runID = new ObjectId(request.params.runID);
    gamePageID = new ObjectId(request.params.gamePageID);

  } catch (error: unknown) {

    console.error(error);

    response.status(404).json({
      message: "Run not found."
    });

    return;

  }

  try {

    // Verify that the run exists.
    const runsCollection = database.collection("runs");
    const runFilter = {
      _id: runID,
      gamePageID
    };

    const runData = await runsCollection.findOne(runFilter);

    if (!runData) {

      response.status(404).json({
        message: "Run not found."
      });

      return;

    }

    // Verify that the user has permission to delete the run.
    const { user } = response.locals;
    if (!runData.ownerID.equals(user._id) && !(request.body.shouldBypassPermissions && user.isModerator)) {

      response.status(403).json({
        message: "You don't have permission to delete this run."
      });

      return;

    }

    // Try to delete the run.
    const { deletedCount } = await runsCollection.deleteOne({
      _id: runData._id
    });

    if (deletedCount == 0) {

      throw new Error("Unknown error while deleting the run.");

    }

    response.status(204).json({});

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

export default deleteRunRouter;
