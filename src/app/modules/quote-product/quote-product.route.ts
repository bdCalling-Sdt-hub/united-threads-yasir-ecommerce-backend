import { Router, Express } from "express";
import multer, { memoryStorage } from "multer";
import { uploadManyToS3, uploadToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { QuoteProductController } from "./quote-product.controller";
import { QuoteProductValidations } from "./quote-product.validation";
import { TImage } from "./quote-product.interface";

const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/products", QuoteProductController.getAllQuoteProduct);
router.get("/single-product/:id", QuoteProductController.getQuoteProductById);
router.post(
  "/create-product",
  auth("ADMIN"),
  upload.fields([
    { name: "frontSide", maxCount: 1 },
    { name: "backSide", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  async (req, res, next) => {
    const files = req.files as {
      frontSide?: Express.Multer.File[];
      backSide?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };

    try {
      let frontSideUrl = null;
      let backSideUrl = null;
      const images: TImage[] = [];

      // Check for both frontSide and backSide
      if (files?.frontSide?.[0]) {
        frontSideUrl = await uploadToS3({
          file: files.frontSide[0],
          fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (files?.backSide?.[0]) {
        backSideUrl = await uploadToS3({
          file: files.backSide[0],
          fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (files?.images?.length) {
        const urls = await uploadManyToS3(
          files.images.map((image) => ({
            file: image,
            path: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
          })),
        );

        urls?.forEach((url) => {
          if (url) {
            images.push(url);
          }
        });
      }

      if (req.body.data) {
        const data = JSON.parse(req?.body?.data);
        if (files?.frontSide?.[0]) {
          data.frontSide = frontSideUrl;
        }

        if (files?.backSide?.[0]) {
          data.backSide = backSideUrl;
        }

        if (images?.length) {
          data.images = images;
        }

        req.body = QuoteProductValidations.updateQuoteProductValidation.parse({
          ...data,
        });
      } else {
        const data: Record<string, unknown> = {};

        if (files?.frontSide?.[0]) {
          data.frontSide = frontSideUrl;
        }

        if (files?.backSide?.[0]) {
          data.backSide = backSideUrl;
        }

        if (images?.length) {
          data.images = images;
        }

        req.body = QuoteProductValidations.updateQuoteProductValidation.parse(data);
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  QuoteProductController.createQuoteProduct,
);

router.patch(
  "/update-product/:id",
  auth("ADMIN"),
  upload.fields([
    { name: "frontSide", maxCount: 1 },
    { name: "backSide", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  async (req, res, next) => {
    const files = req.files as {
      frontSide?: Express.Multer.File[];
      backSide?: Express.Multer.File[];
      images?: Express.Multer.File[];
    };

    try {
      let frontSideUrl = null;
      let backSideUrl = null;
      const images: TImage[] = [];

      // Check for both frontSide and backSide
      if (files?.frontSide?.[0]) {
        frontSideUrl = await uploadToS3({
          file: files.frontSide[0],
          fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (files?.backSide?.[0]) {
        backSideUrl = await uploadToS3({
          file: files.backSide[0],
          fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (files?.images?.length) {
        const urls = await uploadManyToS3(
          files.images.map((image) => ({
            file: image,
            path: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
          })),
        );

        urls?.forEach((url) => {
          if (url) {
            images.push(url);
          }
        });
      }

      if (req.body.data) {
        const data = JSON.parse(req?.body?.data);
        if (files?.frontSide?.[0]) {
          data.frontSide = frontSideUrl;
        }

        if (files?.backSide?.[0]) {
          data.backSide = backSideUrl;
        }

        if (images?.length) {
          data.images = images;
        }

        req.body = QuoteProductValidations.updateQuoteProductValidation.parse({
          ...data,
        });
      } else {
        const data: Record<string, unknown> = {};

        if (files?.frontSide?.[0]) {
          data.frontSide = frontSideUrl;
        }

        if (files?.backSide?.[0]) {
          data.backSide = backSideUrl;
        }

        if (images?.length) {
          data.images = images;
        }

        req.body = QuoteProductValidations.updateQuoteProductValidation.parse(data);
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  QuoteProductController.updateQuoteProduct,
);

router.delete("/delete-product/:id", auth("ADMIN"), QuoteProductController.deleteQuoteProduct);

router.get("/get-size", QuoteProductController.getQuoteProductsCountBySize);
export const QuoteProductRoutes = router;
