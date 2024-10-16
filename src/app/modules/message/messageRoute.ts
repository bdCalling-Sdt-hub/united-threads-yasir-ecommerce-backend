import { Router } from "express";
import httpStatus from "http-status";
import { uploadToS3 } from "../../constant/s3";
import AppError from "../../errors/AppError";
import sendResponse from "../../utils/sendResponse";
import multer, { memoryStorage } from "multer";

const storage = memoryStorage();
const upload = multer({ storage });

const router = Router();

router.post("/upload-image", upload.array("files"), async (req, res, next) => {
  try {
    // Check if files exist
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Please upload at least one file");
    }

    // Handle multiple file upload
    if (Array.isArray(req.files)) {
      const uploadResults = await Promise.all(
        req.files.map(async (file) => {
          const fileName = `united-threads/messages/${Math.floor(100000 + Math.random() * 900000)}`;
          return uploadToS3({ file, fileName });
        }),
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Images uploaded successfully",
        data: uploadResults, // Array of uploaded image URLs
      });
    }

    // Handle single file upload
    else if (req.file) {
      const fileName = `united-threads/messages/${Math.floor(100000 + Math.random() * 900000)}`;
      const uploadedUrl = await uploadToS3({ file: req.file, fileName });

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Image uploaded successfully",
        data: uploadedUrl, // Single uploaded image URL
      });
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "No file found in request");
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const MessageRouter = router;
