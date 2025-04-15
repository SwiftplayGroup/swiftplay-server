import { Router } from "express";
import getPostRouter from "./get.js";
import repliesRouter from "./replies/index.js";
import likesRouter from "./likes/index.js";

const postRouter = Router({
  mergeParams: true,
});

postRouter.use("/", getPostRouter);
postRouter.use("/likes", likesRouter);
postRouter.use("/replies", repliesRouter);

export default postRouter;
