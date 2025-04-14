import { Router } from "express";
import addMemberRouter from "./post.js";

const groupMembersRouter = Router({mergeParams: true});

groupMembersRouter.use("/", addMemberRouter);

export default groupMembersRouter;