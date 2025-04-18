import { Router } from "express";
import getRunsRouter from "./get.js";
import createRunRouter from "./post.js";

const runsRouter = Router({mergeParams: true});

runsRouter.use("/", getRunsRouter);
runsRouter.use("/", createRunRouter);

export default runsRouter;
