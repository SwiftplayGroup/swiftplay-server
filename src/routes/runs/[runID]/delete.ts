import { Router, Request } from "express";
import authenticator from "#utils/authenticator.js";
import Run from "#classes/Run.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { RunNotFoundError } from "#classes/errors/RunNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import User from "#classes/User.js";

const deleteRunRouter = Router({ mergeParams: true });

deleteRunRouter.delete("/", authenticator);
deleteRunRouter.delete("/", async (request: Request<{ runID: string }>, response) => {

  try {

    // Verify that the user has permission to delete the run.
    const run = await Run.getFromID(request.params.runID);

    const user: User = response.locals.user;
    if (!run.ownerID.equals(user._id)) {

      throw new NoPermissionError();

    }

    // Delete the run.
    await run.delete();

    // Let the client know everything went OK.
    console.log(`Successfully deleted Run ${run._id}`);
    response.sendStatus(204);

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof RunNotFoundError || error instanceof InternalServerError || error instanceof NoPermissionError) {
                            
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

export default deleteRunRouter;
