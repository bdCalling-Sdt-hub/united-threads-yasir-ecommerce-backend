import { Router } from "express";
import { CategoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidations } from "./category.validation";

const router = Router();

router.get("/categories", CategoryController.getAllCategory);
router.post("/create-category", auth("ADMIN"), validateRequest(CategoryValidations.createCategoryValidationSchema), CategoryController.createCategory);
