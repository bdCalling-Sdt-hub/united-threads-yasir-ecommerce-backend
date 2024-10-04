import { Router, Express } from "express";
import multer, { memoryStorage } from "multer";
import { uploadToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { QuoteProductController } from "./quote-product.controller";
import { QuoteProductValidations } from "./quote-product.validation";

const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/products", QuoteProductController.getAllQuoteProduct);
router.get("/single-quote/:id", QuoteProductController.getQuoteProductById);
router.post(
  "/create-quote-product",
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
      const images: string[] = [];

      // Check for both frontSide and backSide
      if (files?.frontSide?.[0] && files?.backSide?.[0]) {
        frontSideUrl = await uploadToS3({
          file: files.frontSide[0],
          fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        backSideUrl = await uploadToS3({
          file: files.backSide[0],
          fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (images?.length) {
        await Promise.all(
          images.map(async (image) => {
            const url = await uploadToS3({
              file: image,
              fileName: `united-threads/quotes-product/${Math.floor(100000 + Math.random() * 900000)}`,
            });
            if (url) {
              images.push(url);
            }
          }),
        );
      }

      if (req.body.data) {
        req.body = QuoteProductValidations.createQuoteProductValidation.parse({
          ...JSON.parse(req?.body?.data),
          frontSide: frontSideUrl,
          backSide: backSideUrl,
          images,
        });
      } else {
        req.body = QuoteProductValidations.createQuoteProductValidation.parse({
          frontSide: frontSideUrl,
          backSide: backSideUrl,
          images,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  QuoteProductController.createQuoteProduct,
);

//router.patch(
//  "/update-quote/:id",
//  auth("CUSTOMER"),
//  upload.fields([
//    { name: "frontSide", maxCount: 1 },
//    { name: "backSide", maxCount: 1 },
//  ]),
//  async (req, res, next) => {
//    const files = req.files as {
//      frontSide?: Express.Multer.File[];
//      backSide?: Express.Multer.File[];
//    };

//    try {
//      let frontSideUrl = null;
//      let backSideUrl = null;

//      // Check for both frontSide and backSide
//      if (files?.frontSide?.[0] && files?.backSide?.[0]) {
//        frontSideUrl = await uploadToS3({
//          file: files.frontSide[0],
//          fileName: `united-threads/quotes/${Math.floor(100000 + Math.random() * 900000)}`,
//        });
//        backSideUrl = await uploadToS3({
//          file: files.backSide[0],
//          fileName: `united-threads/quotes/${Math.floor(100000 + Math.random() * 900000)}`,
//        });
//      }

//      if (req.body.data) {
//        req.body = QuoteValidation.updateQuoteSchema.parse({
//          ...JSON.parse(req?.body?.data),
//          frontSide: frontSideUrl,
//          backSide: backSideUrl,
//        });
//      } else {
//        req.body = QuoteValidation.updateQuoteSchema.parse({
//          frontSide: frontSideUrl,
//          backSide: backSideUrl,
//        });
//      }
//      next();
//    } catch (error) {
//      next(error);
//    }
//  },
//  QuoteController.updateQuote,
//);

//router.delete("/delete-quote/:id", auth("ADMIN"), QuoteController.deleteQuote);

export const QuoteProductRoutes = router;
