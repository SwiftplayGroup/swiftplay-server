import { Router } from "express";
import sessionIDRouter from "./[sessionID]/index.js";
import createSessionRouter from "./post.js";

const router = Router({ mergeParams: true });

router.use("/", createSessionRouter);
router.use("/:sessionID", sessionIDRouter);

export default router;
