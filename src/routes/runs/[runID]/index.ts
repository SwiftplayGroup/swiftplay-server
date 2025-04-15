import { Router } from "express";
import getRunRouter from "./get.js";
import editRunRouter from "./patch.js";
import deleteRunRouter from "./delete.js";

const runRouter = Router({ mergeParams: true });

runRouter.use("/", getRunRouter);
runRouter.use("/", editRunRouter);
runRouter.use("/", deleteRunRouter);

export default runRouter;
