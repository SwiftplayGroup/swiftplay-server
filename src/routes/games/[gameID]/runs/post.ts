import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import Run from "#classes/Run.js";
import Game from "#classes/Game.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";
import addToAuditLog from "#utils/addToAuditLog.js";

const createRunRouter = Router({mergeParams: true});

createRunRouter.post("/", authenticator);
createRunRouter.post("/", async (request: Request<{ gameID: string }>, response: AuthenticatedResponse) => {

  // Log the received body
  try {

    const { user } = response.locals;
    const permission = await Permission.getFromHierarchicalName("games.runs.create");
    user.verifyPermission(permission, PermissionAccessLevel.USER);

    const { durationMilliseconds, youtubeWatchID } = request.body;

    // Convert time to an integer and validate
    const timeInt = parseInt(durationMilliseconds, 10);
    if (isNaN(timeInt) || timeInt <= 0) {
      
      throw new BadRequestError("Duration must be an integer that is greater than 0.");

    }

    // Verify that the user provides a valid YouTube video URL
    const youtubeRegex = /^[^"&?\/\s]{11}$/gi;
    if (typeof(youtubeWatchID) !== "string" || !youtubeRegex.test(youtubeWatchID)) {

      throw new BadRequestError("Invalid YouTube watch ID.");

    }

    const game = await Game.getFromID(request.params.gameID);

    const run = await Run.create({ 
      gameID: game._id, 
      durationMilliseconds: timeInt, 
      youtubeWatchID, 
      ownerID: response.locals.user._id
    });

    // Add to the event log.
    addToAuditLog("games.runs.create", user._id, run._id, user.getSessionID());

    // Return a 201 status code on success, along with the run ID
    response.status(201).json(run);

  } catch (error) {

    if (error instanceof BadRequestError || error instanceof GameNotFoundError || error instanceof InternalServerError) {
            
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

export default createRunRouter;