import { Router } from "express";
import gamePageIDRouter from "./[gamePageID]/index.js";
import getGamePagesRouter from "./get.js";
import createGamePageRouter from "./post.js";

const router = Router({mergeParams: true});
router.use("/", getGamePagesRouter);
router.use("/", createGamePageRouter);
router.use("/:gamePageID", gamePageIDRouter);

export default router;