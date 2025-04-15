import { Router } from "express";
import getUserRouter from "./get.js";
import editUserRouter from "./patch.js";

const userRouter = Router({ mergeParams: true });

userRouter.use("/", getUserRouter);
userRouter.use("/", editUserRouter);

export default userRouter;
