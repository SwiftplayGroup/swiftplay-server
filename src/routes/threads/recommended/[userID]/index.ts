import { Router } from "express";
import getRecommendedThreadsRouter from "./get.js";

const recommendedThreadsRouter = Router({
  mergeParams: true,
});

recommendedThreadsRouter.use("/", getRecommendedThreadsRouter);

export default recommendedThreadsRouter;
