import recommendedThreadsUserIDRouter from "./[userID]/index.js";

import { Router } from "express";

const recommendedThreadsRouter = Router({
  mergeParams: true,
});
recommendedThreadsRouter.use("/:userID", recommendedThreadsUserIDRouter);
export default recommendedThreadsRouter;
