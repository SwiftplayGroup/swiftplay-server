import getRecommendedPostsRouter from "./get.js";
import { Router } from "express";

const recommendedPostsRouter = Router({
  mergeParams: true,
});

recommendedPostsRouter.use("/", getRecommendedPostsRouter);

export default recommendedPostsRouter;
