import { Router } from "express";
import database from "#utils/database-generator.js";
import authenticator from "#utils/authenticator.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";

const createGamePageRouter = Router({mergeParams: true});

// Creates a game page.
createGamePageRouter.post("/", authenticator);
createGamePageRouter.post("/", async (request, response: AuthenticatedResponse) => {

  // Verify permissions.
  const { user } = response.locals;
  user.verifyPermission("gamePages.create", 1);

  // Verify that a name was provided.
  const { name } = request.body;
  if (!name || typeof(name) !== "string") {

    return response.status(400).json({
      message: "A game page needs a name."
    });

  }

  if (typeof(name) !== "string" || name.length === 0 || name.length > 128) {

    return response.status(400).json({
      message: "Name must be a string that ranges from 1 to 128 characters."
    });

  }

  try {

    // Make sure the name doesn't conflict with any other name.
    const similarNameFilter = {
      name: new RegExp(`^${name.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await database.collection("gamePages").countDocuments(similarNameFilter) > 0) {

      return response.status(409).json({
        message: "A game page with a similar name already exists."
      });

    }

    // Add the game page to the database.
    const { insertedId: gamePageID } = await database.collection("gamePages").insertOne({name});
    console.log(`Successfully created a game page: ${gamePageID}`);

    // Add the event to the audit log.
    await addToAuditLog("gamePages.create", user._id, gamePageID, user.getSessionID());

    return response.status(201).json({
      id: gamePageID
    });

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

export default createGamePageRouter;
