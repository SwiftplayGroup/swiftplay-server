import { Router } from "express";
import deleteGroupRouter from "./delete.js";
import groupMembersRouter from "./members/index.js";

const groupIDRouter = Router({mergeParams: true});

groupIDRouter.use("/", deleteGroupRouter);
groupIDRouter.use("/members", groupMembersRouter);

export default groupIDRouter;