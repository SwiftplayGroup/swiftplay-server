import { Router } from "express";
import likeRouter from "./[likeID]/index.js";

const router = Router({mergeParams: true});

router.use("/:likeID", likeRouter);

export default router;
