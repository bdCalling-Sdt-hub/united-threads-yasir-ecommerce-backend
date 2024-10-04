/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Express } from "express";
import multer, { memoryStorage } from "multer";
import { uploadManyToS3, uploadToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { ProductController } from "./product.controller";
import { ProductValidations } from "./product.validation";
import { TImage } from "../quote-product/quote-product.interface";
const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/products", ProductController.getAllProduct);
router.get("/single-product/:id", ProductController.getProductById);
router.post(
  "/create-product",
  auth("ADMIN"),
  upload.fields([
    { name: "primaryImage", maxCount: 1 }, // single primary image
    { name: "images", maxCount: 4 }, // up to 4 additional images
  ]),
  async (req, res, next) => {
    try {
      const files = req.files as {
        primaryImage?: Express.Multer.File[];
        images?: Express.Multer.File[];
      };

      let primaryImageUrl = null;
      const images: TImage[] = [];

      // Check for primaryImage
      if (files?.primaryImage?.[0]) {
        primaryImageUrl = await uploadToS3({
          file: files.primaryImage[0],
          fileName: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      // Check for additional images
      if (files?.images?.length) {
        const urls = await uploadManyToS3(
          files.images.map((image) => ({
            file: image,
            path: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
          })),
        );

        urls.forEach((url) => {
          if (url) {
            images.push(url);
          }
        });
      }

      // Handle body data and images
      if (req.body.data) {
        req.body = ProductValidations.productSchema.parse({
          ...JSON.parse(req.body.data),
          primaryImage: primaryImageUrl,
          images,
        });
      } else {
        req.body = ProductValidations.productSchema.parse({
          primaryImage: primaryImageUrl,
          images,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  ProductController.createProduct,
);

router.patch(
  "/update-product/:id",
  auth("ADMIN"),
  upload.fields([
    { name: "primaryImage", maxCount: 1 }, // Single primary image
    { name: "images", maxCount: 4 }, // Up to 4 additional images
  ]),
  async (req, res, next) => {
    const files = req.files as {
      primaryImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };

    try {
      let primaryImageUrl = null;
      const images: TImage[] = [];

      // Check for the primaryImage
      if (files?.primaryImage?.[0]) {
        primaryImageUrl = await uploadToS3({
          file: files.primaryImage[0],
          fileName: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      // Check for additional images
      if (files?.images?.length) {
        const urls = await uploadManyToS3(
          files.images.map((image) => ({
            file: image,
            path: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
          })),
        );

        urls.forEach((url) => {
          if (url) {
            images.push(url);
          }
        });
      }

      if (req.body?.data) {
        const data = req.body.data;

        if (files?.primaryImage?.[0]) {
          data.primaryImage = primaryImageUrl;
        }

        if (images.length) {
          data.images = images;
        }

        req.body = ProductValidations.productUpdateSchema.parse({
          ...JSON.parse(data),
        });
      } else {
        const data: Record<string, unknown> = {};

        if (files?.primaryImage?.[0]) {
          data.primaryImage = primaryImageUrl;
        }

        if (images.length) {
          data.images = images;
        }

        req.body = ProductValidations.productUpdateSchema.parse(data);
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
