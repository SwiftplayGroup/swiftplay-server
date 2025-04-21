import { Router } from "express";
import gamePageIDRouter from "./[gameID]/index.js";
import getgamesRouter from "./get.js";
import createGamePageRouter from "./post.js";

const router = Router({mergeParams: true});
router.use("/", getgamesRouter);
router.use("/", createGamePageRouter);
router.use("/:gameID", gamePageIDRouter);

export default router;