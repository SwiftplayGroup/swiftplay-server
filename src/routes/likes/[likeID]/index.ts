import { Router } from "express";
import deleteLikeRouter from "./delete.js";
import getLikeRouter from "./get.js";

const likeRouter = Router({
  mergeParams: true,
});

likeRouter.use("/", deleteLikeRouter);
likeRouter.use("/", getLikeRouter);

export default likeRouter;
