import { Router } from "express";
import postRouter from "./[postID]/index.js";
import getPostsRouter from "./get.js";

const postsRouter = Router();

postsRouter.use("/", getPostsRouter);
postsRouter.use("/:postID", postRouter);

export default postsRouter;
