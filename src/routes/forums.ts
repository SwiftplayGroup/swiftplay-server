import { Router } from "express";
import { forumsRouter } from "./forums/[forumID].js";

const router = Router();

router.use("/forums", forumsRouter);
