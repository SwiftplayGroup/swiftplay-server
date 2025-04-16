/**
 * A router that groups related endpoint routers.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Router } from "express";
import getThreadsRouter from "./get.js";
import createThreadRouter from "./post.js";

const threadsRouter = Router({
  mergeParams: true,
});

threadsRouter.use("/", createThreadRouter);
threadsRouter.use("/", getThreadsRouter);

export default threadsRouter;
