import { Router } from "express";
import updateEmbeddingsRouter from "./patch.js";

const EmbeddingsRouter = Router({ mergeParams: true });

EmbeddingsRouter.use("/", updateEmbeddingsRouter);

export default EmbeddingsRouter;
