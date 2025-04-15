import { Router, Request } from "express";
import getPostRouter from "./get.js";

const postRouter = Router({
  mergeParams: true,
});

postRouter.use("/", getPostRouter);

export default postRouter;
