import { Router } from "express";
import createReplyRouter from "./post.js";

const repliesRouter = Router({
  mergeParams: true,
});

repliesRouter.use("/", createReplyRouter);

export default repliesRouter;
