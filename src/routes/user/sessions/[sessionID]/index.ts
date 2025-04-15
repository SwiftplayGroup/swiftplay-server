import { Router } from "express";
import deleteSessionRouter from "./delete.js";

const sessionRouter = Router({ mergeParams: true });

sessionRouter.use("/", deleteSessionRouter);

export default sessionRouter;
