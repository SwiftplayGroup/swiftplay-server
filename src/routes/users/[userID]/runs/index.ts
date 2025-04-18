import { Router } from "express";
import getRunsRouter from "./get.js";

const userRunsRouter = Router({mergeParams: true});

userRunsRouter.use("/", getRunsRouter);

export default userRunsRouter;
