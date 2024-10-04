/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { uploadManyToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { ProductController } from "./product.controller";
import { ProductValidations } from "./product.validation";
const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/products", ProductController.getAllProduct);
router.get("/single-product/:id", ProductController.getProductById);
router.post(
  "/create-product",
  auth("ADMIN"),
  upload.array("images"),
  async (req, res, next) => {
    try {
      if (req?.files?.length) {
        const files: TImage[] = (req.files as any[]).map((file) => ({
          file,
          path: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
          key: file.originalname,
        }));

        const images = await uploadManyToS3(files);

        if (req.body.data) {
          req.body = ProductValidations.productSchema.parse({
            ...JSON.parse(req?.body?.data),
            images,
          });
        } else {
          req.body = ProductValidations.productSchema.parse({
            images,
          });
        }
      } else {
        req.body = ProductValidations.productSchema.parse(JSON.parse(req?.body?.data));
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  ProductController.createProduct,
);

type TImage = {
  file: any;
  path: string;
  key?: string;
};

router.patch(
  "/update-product/:id",
  auth("ADMIN"),
  upload.array("images"),
  async (req, res, next) => {
    try {
      if (req?.files?.length) {
        const files: TImage[] = (req.files as any[]).map((file) => ({
          file,
          path: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
          key: file.originalname,
        }));

        const images = await uploadManyToS3(files);

        if (req.body?.data) {
          req.body = ProductValidations.productUpdateSchema.parse({
            ...JSON.parse(req?.body?.data),
            images: images,
          });
        } else {
          req.body = ProductValidations.productUpdateSchema.parse({
            images: images,
          });
        }
      } else {
        req.body = ProductValidations.productUpdateSchema
          .partial()
          .parse(JSON.parse(req?.body?.data));
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  ProductController.updateProduct,
);

router.delete("/delete-product/:id", auth("ADMIN"), ProductController.deleteProduct);

router.get("/get-size", ProductController.getProductsCountBySize);

export const ProductRoute = router;
