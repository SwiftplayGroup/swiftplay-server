import { Request, Router } from "express";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Game from "#classes/Game.js";

const getGamePageRouter = Router({ mergeParams: true });

getGamePageRouter.get("/", async (request: Request<{ gameID: string }>, response) => {
  
  try {

    const game = await Game.getFromID(request.params.gameID);
    response.json(game);

  } catch (error: unknown) {

    if (error instanceof GameNotFoundError || error instanceof InternalServerError) {
                
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

export default getGamePageRouter;
