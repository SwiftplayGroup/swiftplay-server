import { Router } from "express";
import addMemberRouter from "./post.js";
import removeMemberRouter from "./delete.js";

const groupMembersRouter = Router({mergeParams: true});

groupMembersRouter.use("/", addMemberRouter);
groupMembersRouter.use("/", removeMemberRouter);

export default groupMembersRouter;