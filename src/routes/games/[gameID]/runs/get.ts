import { Request, Router } from "express";
import Game from "#classes/Game.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Run from "#classes/Run.js";

const getRunsRouter = Router({mergeParams: true});

getRunsRouter.get("/", async (request: Request<{ gameID: string }>, response) => {

  try {

    // Return the list of runs.
    const game = await Game.getFromID(request.params.gameID);
    const runs = await Run.find({
      $and: [
        {
          gameID: game._id
        },
        {
          ...(request.query.include_unverified === "true" ? {} : {
            verification: request.query.unverified_only === "true" ? undefined : {
              $ne: undefined
            }
          })
        },
        {
          ...(request.query.include_removed === "true" ? {} : {
            removal: request.query.removed_only === "true" ? {
              $ne: undefined
            } : undefined
          })
        }
      ]
    });
    
    const extendedRuns = [];
    for (const run of runs) {

      const extendedRun = await run.getExtendedProperties();
      extendedRuns.push(extendedRun);

    }

    response.json(extendedRuns);

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

export default getRunsRouter;