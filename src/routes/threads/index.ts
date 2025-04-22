import { Router } from "express";
import threadRouter from "./[threadID]/index.js";
import getThreadsRouter from "./get.js";

const threadsRouter = Router({
  mergeParams: true,
});

threadsRouter.use("/", getThreadsRouter);
threadsRouter.use("/:threadID", threadRouter);

export default threadsRouter;
