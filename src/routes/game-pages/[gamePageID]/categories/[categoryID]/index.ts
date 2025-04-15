import { Router } from "express";
import deleteCategoryRouter from "./delete.js";
import editCategoryRouter from "./patch.js";

const router = Router({ mergeParams: true });

router.use("/", deleteCategoryRouter);
router.use("/", editCategoryRouter);

export default router;
