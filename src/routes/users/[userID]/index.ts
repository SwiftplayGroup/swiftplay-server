import { Router } from "express";
import getUserRouter from "./get.js";
import editUserRouter from "./patch.js";
import userRunsRouter from "./runs/index.js";
import userLikesRouter from "./likes/index.js";

const userRouter = Router({ mergeParams: true });

userRouter.use("/", getUserRouter);
userRouter.use("/", editUserRouter);
userRouter.use("/likes", userLikesRouter);
userRouter.use("/runs", userRunsRouter);

export default userRouter;
