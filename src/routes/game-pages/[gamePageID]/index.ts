import { Router } from "express";
import categoriesRouter from "./categories/index.js";
import runsRouter from "./runs/index.js";
import deleteGamePageRouter from "./delete.js";
import getGamePageRouter from "./get.js";
import editGamePageRouter from "./patch.js";

const gamePageRouter = Router({ mergeParams: true });

gamePageRouter.use("/", deleteGamePageRouter);
gamePageRouter.use("/", getGamePageRouter);
gamePageRouter.use("/", editGamePageRouter);
gamePageRouter.use("/categories", categoriesRouter);
gamePageRouter.use("/runs", runsRouter);

export default gamePageRouter;
