import { Router } from "express";
import sessionIDRouter from "./[sessionID]/index.js";
import byTokenRouter from "./by-token.js";
import createSessionRouter from "./post.js";

const router = Router({ mergeParams: true });

router.use("/", createSessionRouter);
router.use("/:sessionID", sessionIDRouter);
router.use("/by-token", byTokenRouter);

export default router;
