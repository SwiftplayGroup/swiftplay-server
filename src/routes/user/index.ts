import { Router } from "express";
import sessionsRouter from "./sessions/index.js";
import getAuthenticatedUserRouter from "./get.js";

const router = Router();

router.use("/", getAuthenticatedUserRouter);
router.use("/sessions", sessionsRouter);

export default router;
