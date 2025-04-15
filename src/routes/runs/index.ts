import { Router } from "express";
import runRouter from "./[runID]/index.js";

const router = Router();

router.use("/:runID", runRouter);

export default router;