import { Router } from "express";
import authenticator from "#utils/authenticator.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import Game from "#classes/Game.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";

const createGamePageRouter = Router({mergeParams: true});

// Creates a game page.
createGamePageRouter.post("/", authenticator);
createGamePageRouter.post("/", async (request, response: AuthenticatedResponse) => {

  try {

    // Verify permissions.
    const { user } = response.locals;
    user.verifyPermission("games.create", 1);

    // Verify that a name was provided.
    const { name } = request.body;
    if (!name || typeof(name) !== "string") {

      throw new BadRequestError("A game needs a name.");

    }

    if (typeof(name) !== "string" || name.length === 0 || name.length > 128) {

      throw new BadRequestError("Name must be a string that ranges from 1 to 128 characters.");

    }

    // Make sure the name doesn't conflict with any other name.
    const similarNameFilter = {
      name: new RegExp(`^${name.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await Game.collection.countDocuments(similarNameFilter) > 0) {

      response.status(409).json({
        message: "A game with a similar name already exists."
      });

      return;

    }

    // Add the game page to the database.
    const game = await Game.create({name});
    console.log(`Successfully created a game: ${game._id}`);

    // Add the event to the audit log.
    await addToAuditLog("gamePages.create", user._id, game._id, user.getSessionID());

    response.status(201).json(game);

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof NoPermissionError || error instanceof InternalServerError) {
                    
      response.status(error.statusCode).json({
        message: error.message
      });

    } else {

      console.error(error);

      const internalServerError = new InternalServerError();
      response.status(internalServerError.statusCode).json({
        message: internalServerError.message
      });

    }

  }

});

export default createGamePageRouter;
