import { Router, Request } from "express";
import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import authenticator from "#utils/authenticator.js";

const editRunRouter = Router({ mergeParams: true });

editRunRouter.patch("/", authenticator);
editRunRouter.patch("/", async (request: Request<{ gamePageID: string; runID: string }>, response) => {

  // Confirm that the run ID is valid.
  let runID;
  let gamePageID;

  try {

    runID = new ObjectId(request.params.runID);
    gamePageID = new ObjectId(request.params.gamePageID);

  } catch (error: unknown) {

    console.error(error);

    return response.status(404).json({
      message: "Run not found."
    });

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

      return response.status(404).json({
        message: "Run not found."
      });

    }

    // Verify that the user has permission to delete the run.
    const { account } = response.locals;
    if (!runData.creatorID.equals(account._id) && !(request.body.shouldBypassPermissions && account.isModerator)) {

      return response.status(403).json({
        message: "You don't have permission to update this run."
      });

    }

    const modifications = request.body.modifications;

    if (!modifications || !(typeof (modifications) === "object" && !(modifications instanceof Array))) {

      return response.status(400).json({
        message: `Your request body is missing a modifications object.`
      });

    }

    const santitizedModifications: { [key: string]: unknown } = {};
    for (const key of Object.keys(modifications)) {

      const validationCheckers: { [key: string]: (value: unknown) => boolean } = {
        isVerified: (value: unknown) => typeof (value) === "boolean",
        creatorID: (value: unknown) => typeof (value) === "string",
        time: (value: unknown) => typeof (value) === "number",
        url: (value: unknown) => typeof (value) === "string"
      };

      if (!validationCheckers[key]) {

        continue;

      }

      if (!validationCheckers[key](modifications[key])) {

        return response.status(400).json({
          message: `Validation failed for key ${key}. Check the key name and value and try again.`
        });

      }

      if ((key === "isVerified" || key === "creatorID") && !response.locals.user.isModerator) {

        return response.status(403).json({
          message: `You don't have permission to modify the ${key} key.`
        });

      }

      santitizedModifications[key] = modifications[key];

    }

    // Try to update the run.
    await runsCollection.updateOne({
      _id: runData._id
    }, {
      $set: santitizedModifications
    });

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

  return response.status(200).json({});

});

export default editRunRouter;
