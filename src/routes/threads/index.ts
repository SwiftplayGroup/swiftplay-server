import { Router } from "express";
import threadRouter from "./[threadID]/index.js";
import getThreadsRouter from "./get.js";
import recommendedThreadsRouter from "./recommended/index.js";

const threadsRouter = Router({
  mergeParams: true,
});

threadsRouter.use("/", getThreadsRouter);
threadsRouter.use("/:threadID", threadRouter);
threadsRouter.use("/recommended", recommendedThreadsRouter);

export default threadsRouter;
