import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import Run from "#classes/Run.js";
import Game from "#classes/Game.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";

const createRunRouter = Router({mergeParams: true});

createRunRouter.post("/", authenticator);
createRunRouter.post("/", async (request: Request<{ gameID: string }>, response: AuthenticatedResponse) => {

  // Log the received body
  try {

    const { user } = response.locals;
    user.verifyPermission("games.runs.create", 1);

    const { time, url } = request.body;

    // Convert time to an integer and validate
    const timeInt = parseInt(time, 10);
    if (isNaN(timeInt) || timeInt <= 0) {
      response.status(400).json({ message: "Time must be an integer, representing milliseconds." });
      return;
    }

    // Verify that the user provides a valid YouTube video URL
    const youtubeRegex = /^(https?:\/\/)?((www\.)?youtube\.com\/watch\?v=|youtu\.?be\/).+$/;
    if (!url || typeof url !== "string" || !youtubeRegex.test(url)) {
      response.status(400).json({ message: "Invalid YouTube video URL." });
      return;
    }

    const game = await Game.getFromID(request.params.gameID);

    const run = await Run.create({ 
      gameID: game._id, 
      time: timeInt, 
      url, 
      ownerID: response.locals.user._id 
    });

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