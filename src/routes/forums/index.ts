import { Router } from "express";
import forumRouter from "./[forumID]/index.js";
import getForumRouter from "./get.js";
import createForumRouter from "./post.js";

const router = Router({mergeParams: true});

router.use("/", getForumRouter);
router.use("/", createForumRouter);
router.use("/:forumID", forumRouter);

export default router;
