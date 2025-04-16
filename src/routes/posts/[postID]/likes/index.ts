import { Router } from "express";
import getLikesRouter from "./get.js";
import createLikeRouter from "./post.js";
import deleteLikesRouter from "./delete.js";

const likesRouter = Router({
  mergeParams: true,
});

likesRouter.use("/", getLikesRouter);
likesRouter.use("/", deleteLikesRouter);
likesRouter.use("/", createLikeRouter);

export default likesRouter;
