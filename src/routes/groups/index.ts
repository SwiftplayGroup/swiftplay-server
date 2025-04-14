import { Router } from "express";
import createGroupRouter from "./post.js";
import groupIDRouter from "./[groupID]/index.js";

const groupsRouter = Router({mergeParams: true});

groupsRouter.use("/", createGroupRouter);
groupsRouter.use("/:groupID", groupIDRouter);

export default groupsRouter;
