import { Router } from "express";
import getPostsRouter from "./get.js";
import createPostRouter from "./post.js";

const postsRouter = Router();

postsRouter.use("/", getPostsRouter);
postsRouter.use("/", createPostRouter);

export default postsRouter;
