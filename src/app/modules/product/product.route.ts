import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { uploadToS3 } from "../../constant/s3";
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
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const image = await uploadToS3({
          file: req.file,
          fileName: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body.data) {
          req.body = ProductValidations.productSchema.parse({
            ...JSON.parse(req?.body?.data),
            image,
          });
        } else {
          req.body = ProductValidations.productSchema.parse({
            image,
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

router.patch(
  "/update-product/:id",
  auth("ADMIN"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const image = await uploadToS3({
          file: req.file,
          fileName: `united-threads/products/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body?.data) {
          req.body = ProductValidations.productSchema.parse({
            ...JSON.parse(req?.body?.data),
            image,
          });
        } else {
          req.body = ProductValidations.productSchema.parse({
            image,
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
  ProductController.updateProduct,
);

router.delete("/delete-product/:id", auth("ADMIN"), ProductController.deleteProduct);

export const ProductRoute = router;
