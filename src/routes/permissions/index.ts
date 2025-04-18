import { Router } from "express";
import getPermissionsRouter from "./get.js";

const permissionsRouter = Router();

permissionsRouter.use("/", getPermissionsRouter);

export default permissionsRouter;
