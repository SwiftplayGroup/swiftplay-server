import { Router } from "express";
import userRouter from "./[userID]/index.js";
import accountLikesRouter from "./[userID]/likes/index.js";
import createUserRouter from "./post.js";

const router = Router({mergeParams: true});

router.use("/", createUserRouter);
router.use("/:userID", userRouter);
router.use("/likes/:accountID", accountLikesRouter);

export default router;
