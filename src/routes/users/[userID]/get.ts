import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { UserNotFoundError } from "#classes/errors/UserNotFoundError.js";
import User from "#classes/User.js";
import { Request, Router } from "express";

const getUserRouter = Router({ mergeParams: true });

getUserRouter.get("/", async (request: Request<{ userID: string }>, response) => {

  try {

    const user = await User.getFromID(request.params.userID);
    response.json(user);

  } catch (error: unknown) {
    
    if (error instanceof UserNotFoundError || error instanceof InternalServerError) {
                        
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

export default getUserRouter;
