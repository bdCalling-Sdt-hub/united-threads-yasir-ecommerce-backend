import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { uploadToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { QuoteCategoryController } from "./quote-category.controller";
import { CategoryValidations } from "./quote-category.validation";
const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/categories", QuoteCategoryController.getAllCategory);
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
  QuoteCategoryController.createCategory,
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
  QuoteCategoryController.updateCategory,
);

router.delete("/delete-category/:id", auth("ADMIN"), QuoteCategoryController.deleteCategory);

export const QuoteCategoryRoutes = router;
