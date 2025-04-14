import { Router } from "express";
import runIDRouter from "./[runID]/index.js";

const router = Router();

router.use("/:runID", runIDRouter);

export default router;