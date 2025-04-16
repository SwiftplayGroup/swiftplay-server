import { Router } from "express";
import postsRouter from "./posts/index.js";
import getThreadRouter from "./get.js";

const threadRouter = Router();

threadRouter.use("/", getThreadRouter);
threadRouter.use("/posts", postsRouter);

export default threadRouter;
