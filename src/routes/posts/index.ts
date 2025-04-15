import { Router } from "express";
import postRouter from "./[postID]/index.js";
import getPostsRouter from "./get.js";

const router = Router();

router.use("/", getPostsRouter);
router.use("/:postID", postRouter);

export default router;
