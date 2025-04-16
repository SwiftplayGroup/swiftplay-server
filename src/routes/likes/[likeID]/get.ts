import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { LikeNotFoundError } from "#classes/errors/LikeNotFoundError.js";
import Like from "#classes/Like.js";

const getLikeRouter = Router({
  mergeParams: true,
});

getLikeRouter.get("/", async (req: Request<{ likeID: string }>, res) => {

  try {

    const like = await Like.getFromID(req.params.likeID);
    res.json(like);

  } catch (error) {

    if (error instanceof InternalServerError || error instanceof LikeNotFoundError) {

      res.status(error.statusCode).json({
        message: error.message
      });

    } else {

      console.warn(error);

      const internalServerError = new InternalServerError();
      res.status(internalServerError.statusCode).json({
        message: internalServerError.message
      });

    }

  }
  
});

export default getLikeRouter;
