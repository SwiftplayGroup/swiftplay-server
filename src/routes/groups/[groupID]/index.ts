import { Router } from "express";
import deleteGroupRouter from "./delete.js";

const groupIDRouter = Router({mergeParams: true});

groupIDRouter.use("/", deleteGroupRouter);

export default groupIDRouter;