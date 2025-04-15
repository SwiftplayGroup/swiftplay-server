import { Router } from "express";
import getThreadsRouter from "./get.js";

const threadsRouter = Router({
  mergeParams: true,
});

threadsRouter.use("/", getThreadsRouter);

export default threadsRouter;
