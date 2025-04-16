import { Router } from "express";
import getPostsRouter from "./get.js";

const postsRouter = Router();

postsRouter.use("/", getPostsRouter);

export default postsRouter;
