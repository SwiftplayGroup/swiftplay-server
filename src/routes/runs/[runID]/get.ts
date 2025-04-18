import { Router, Request, Response } from "express";
import Run from "#classes/Run.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { RunNotFoundError } from "#classes/errors/RunNotFoundError.js";

const getRunRouter = Router({ mergeParams: true });

getRunRouter.get("/", async (request: Request<{ runID: string }>, response: Response) => {

  const { runID } = request.params;

  try {

    const run = await Run.getFromID(runID);
    const extendedRun = await run.getExtendedProperties();

    response.json(extendedRun);

  } catch (error) {
    
    if (error instanceof BadRequestError || error instanceof RunNotFoundError || error instanceof InternalServerError) {
                        
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

export default getRunRouter;