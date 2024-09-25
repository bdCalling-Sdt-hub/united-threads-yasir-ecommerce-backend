import { Router, Express } from "express";
import multer, { memoryStorage } from "multer";
import { uploadToS3 } from "../../constant/s3";
import auth from "../../middlewares/auth";
import { QuoteValidation } from "./quote.validation";
import { QuoteController } from "./quote.controller";
const storage = memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get("/quotes", QuoteController.getAllQuote);
router.get("/single-quote/:id", QuoteController.getQuoteById);
router.post(
  "/create-quote",
  auth("CUSTOMER"),
  upload.fields([
    { name: "frontSide", maxCount: 1 },
    { name: "backSide", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const files = req.files as {
      frontSide?: Express.Multer.File[];
      backSide?: Express.Multer.File[];
    };

    try {
      let frontSideUrl = null;
      let backSideUrl = null;

      // Check for both frontSide and backSide
      if (files?.frontSide?.[0] && files?.backSide?.[0]) {
        frontSideUrl = await uploadToS3({
          file: files.frontSide[0],
          fileName: `united-threads/quotes/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        backSideUrl = await uploadToS3({
          file: files.backSide[0],
          fileName: `united-threads/quotes/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (req.body.data) {
        req.body = QuoteValidation.quoteSchema.parse({
          ...JSON.parse(req?.body?.data),
          frontSide: frontSideUrl,
          backSide: backSideUrl,
        });
      } else {
        req.body = QuoteValidation.quoteSchema.parse({
          frontSide: frontSideUrl,
          backSide: backSideUrl,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  QuoteController.createQuote,
);

router.patch(
  "/update-quote/:id",
  auth("CUSTOMER"),
  upload.fields([
    { name: "frontSide", maxCount: 1 },
    { name: "backSide", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const files = req.files as {
      frontSide?: Express.Multer.File[];
      backSide?: Express.Multer.File[];
    };

    try {
      let frontSideUrl = null;
      let backSideUrl = null;

      // Check for both frontSide and backSide
      if (files?.frontSide?.[0] && files?.backSide?.[0]) {
        frontSideUrl = await uploadToS3({
          file: files.frontSide[0],
          fileName: `united-threads/quotes/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        backSideUrl = await uploadToS3({
          file: files.backSide[0],
          fileName: `united-threads/quotes/${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      if (req.body.data) {
        req.body = QuoteValidation.updateQuoteSchema.parse({
          ...JSON.parse(req?.body?.data),
          frontSide: frontSideUrl,
          backSide: backSideUrl,
        });
      } else {
        req.body = QuoteValidation.updateQuoteSchema.parse({
          frontSide: frontSideUrl,
          backSide: backSideUrl,
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  QuoteController.updateQuote,
);

router.delete("/delete-quote/:id", auth("ADMIN"), QuoteController.deleteQuote);

export const QuoteRoutes = router;
