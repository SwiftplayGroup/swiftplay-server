import { Router } from "express";
import addMemberRouter from "./post.js";
import removeMemberRouter from "./delete.js";
import getMembersRouter from "./get.js";

const groupMembersRouter = Router({mergeParams: true});

groupMembersRouter.use("/", addMemberRouter);
groupMembersRouter.use("/", removeMemberRouter);
groupMembersRouter.use("/", getMembersRouter);

export default groupMembersRouter;