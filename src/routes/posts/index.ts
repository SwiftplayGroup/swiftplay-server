import { Router } from "express";
import postRouter from "./[postID]/index.js";
import getPostsRouter from "./get.js";
import recommendedPostsRouter from "./recommended/index.js";
const postsRouter = Router();

postsRouter.use("/", getPostsRouter);
postsRouter.use("/:postID", postRouter);
postsRouter.use("/recommended", recommendedPostsRouter);

export default postsRouter;
