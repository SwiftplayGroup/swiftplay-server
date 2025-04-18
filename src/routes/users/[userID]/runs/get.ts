import { Router, Request, Response } from "express";
import User from "#classes/User.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { UserNotFoundError } from "#classes/errors/UserNotFoundError.js";

const getRunsRouter = Router({ mergeParams: true });

getRunsRouter.get("/", async (request: Request<{ userID: string }>, response: Response) => {

  const { userID } = request.params;

  try {

    const user = await User.getFromID(userID);
    const runs = await user.getRuns();
    const extendedRuns = [];
    for (const run of runs) {

      extendedRuns.push(await run.getExtendedProperties());

    }

    response.json(extendedRuns);

  } catch (error) {

    if (error instanceof InternalServerError || error instanceof UserNotFoundError) {
        
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