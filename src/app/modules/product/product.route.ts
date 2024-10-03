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

        const imagesPayload = images.map(({ url }) => url);

        if (req.body.data) {
          req.body = ProductValidations.productSchema.parse({
            ...JSON.parse(req?.body?.data),
            images: imagesPayload,
          });
        } else {
          req.body = ProductValidations.productSchema.parse({
            images: imagesPayload,
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
        const imagesPayload = images.map(({ url }) => url);
        if (req.body?.data) {
          req.body = ProductValidations.productSchema.parse({
            ...JSON.parse(req?.body?.data),
            image: imagesPayload,
          });
        } else {
          req.body = ProductValidations.productSchema.parse({
            image: imagesPayload,
          });
        }
      } else {
        req.body = ProductValidations.productSchema.partial().parse(JSON.parse(req?.body?.data));
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  ProductController.updateProduct,
);

router.delete("/delete-product/:id", auth("ADMIN"), ProductController.deleteProduct);

export const ProductRoute = router;
