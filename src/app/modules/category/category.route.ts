import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { uploadToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { CategoryController } from "./category.controller";
import { CategoryValidations } from "./category.validation";
const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/categories", CategoryController.getAllCategory);
router.post(
  "/create-category",
  auth("ADMIN"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const image = await uploadToS3({
          file: req.file,
          fileName: `united-threads/categories/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body?.data) {
          req.body = CategoryValidations.createCategoryValidationSchema.parse({
            ...JSON.parse(req?.body?.data),
            image,
          });
        } else {
          req.body = CategoryValidations.createCategoryValidationSchema.parse({
            image,
          });
        }
      } else {
        req.body = CategoryValidations.createCategoryValidationSchema.parse(
          JSON.parse(req?.body?.data),
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  CategoryController.createCategory,
);

router.patch(
  "/update-category/:id",
  auth("ADMIN"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const image = await uploadToS3({
          file: req.file,
          fileName: `united-threads/categories/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body?.data) {
          req.body = CategoryValidations.updateCategoryValidationSchema.parse({
            ...JSON.parse(req?.body?.data),
            image,
          });
        } else {
          req.body = CategoryValidations.updateCategoryValidationSchema.parse({
            image,
          });
        }
      } else {
        req.body = CategoryValidations.updateCategoryValidationSchema.parse(
          JSON.parse(req?.body?.data),
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  CategoryController.updateCategory,
);

router.delete("/delete-category/:id", auth("ADMIN"), CategoryController.deleteCategory);

export const CategoryRoutes = router;
