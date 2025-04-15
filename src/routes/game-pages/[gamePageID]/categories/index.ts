import { Router } from "express";
import categoryIDRouter from "./[categoryID]/index.js";
import getCategoriesRouter from "./get.js";
import createCategoryRouter from "./post.js";

const categoriesRouter = Router({ mergeParams: true });

categoriesRouter.use("/", getCategoriesRouter);
categoriesRouter.use("/", createCategoryRouter);
categoriesRouter.use("/:categoryID", categoryIDRouter);

export default categoriesRouter;
