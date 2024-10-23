import { Router } from "express";
import auth from "../../middlewares/auth";
import multer, { memoryStorage } from "multer";
import { LibraryValidations } from "./library.validation";
import { uploadToS3 } from "../../constant/s3";
import { LibraryController } from "./library.controller";

const router = Router();

const storage = memoryStorage();
const upload = multer({ storage });

router.get("/libraries", LibraryController.getAllLibrary);
router.get("/single-library/:id", LibraryController.getSingleLibrary);

router.post(
  "/create-library",
  auth("ADMIN"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const file = await uploadToS3({
          file: req.file,
          fileName: `united-threads/library/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body?.data) {
          req.body = LibraryValidations.createLibraryValidation.parse({
            ...JSON.parse(req?.body?.data),
            file,
          });
        } else {
          req.body = LibraryValidations.createLibraryValidation.parse({ file });
        }
      } else {
        req.body = LibraryValidations.createLibraryValidation.parse(JSON.parse(req?.body?.data));
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  LibraryController.createLibrary,
);

router.post(
  "/update-library/:id",
  auth("ADMIN"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const file = await uploadToS3({
          file: req.file,
          fileName: `united-threads/library/${Math.floor(100000 + Math.random() * 900000)}`,
        });
        if (req.body?.data) {
          req.body = LibraryValidations.createLibraryValidation.parse({
            ...JSON.parse(req?.body?.data),
            file,
          });
        } else {
          req.body = LibraryValidations.createLibraryValidation.parse({ file });
        }
      } else {
        req.body = LibraryValidations.createLibraryValidation.parse(JSON.parse(req?.body?.data));
      }

      next();
    } catch (error) {
      next(error);
    }
  },
  LibraryController.createLibrary,
);

router.delete("/delete-library/:id", auth("ADMIN"), LibraryController.deleteLibrary);

export const LibraryRoutes = router;