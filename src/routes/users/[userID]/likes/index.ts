import { Router } from "express";
import getUserLikesRouter from "./get.js";

const userLikesRouter = Router({ mergeParams: true });

userLikesRouter.use("/", getUserLikesRouter);

export default userLikesRouter;
