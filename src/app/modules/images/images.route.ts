import { Router } from "express";
import { ImageValidations } from "./images.validation";
import { uploadToS3 } from "../../constant/s3";
import { ImageController } from "./images.controller";

const router = Router();

router.post(
  "/upload-image",
  async (req, res, next) => {
    try {
      if (req.file) {
        const image = await uploadToS3({
          file: req.file,
          fileName: `united-threads/images/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body?.data) {
          req.body = ImageValidations.imageSchema.parse({
            ...JSON.parse(req?.body?.data),
            image,
          });
        } else {
          req.body = ImageValidations.imageSchema.parse({ image });
        }
      } else {
        req.body = ImageValidations.imageSchema.parse(JSON.parse(req?.body?.data));
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  ImageController.uploadImages,
);
