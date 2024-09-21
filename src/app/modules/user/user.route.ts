import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./user.controller";
//const storage = memoryStorage();
//const upload = multer({ storage });

const router = Router();

router.get("/all-users", auth("ADMIN"), UserControllers.getAllUser);
router.get("/users-count", auth("ADMIN"), UserControllers.getUsersCount);
router.get("/profile", auth("ADMIN"), UserControllers.getProfile);
router.get("/get-single-user/:userId", auth("ADMIN"), UserControllers.getSingleUser);
//router.patch(
//  "/update-profile",
//  auth("ADMIN"),
//  upload.single("profilePicture"),
//  async (req, res, next) => {
//    try {
//      if (req.file) {
//        const profilePicture = await uploadToS3({
//          file: req.file,
//          fileName: `united-threads/users/${Math.floor(100000 + Math.random() * 900000)}`,
//        });
//        req.body = UserValidations.updateAdminProfileSchema.parse({
//          ...JSON.parse(req?.body?.data),
//          profilePicture,
//        });
//      } else {
//        req.body = UserValidations.updateAdminProfileSchema.parse(JSON.parse(req?.body?.data));
//      }
//      next();
//    } catch (error) {
//      next(error);
//    }
//  },
//  UserControllers.updateProfile,
//);

router.patch("/update-user/:slug", auth("ADMIN"), UserControllers.updateUser);

export const UserRoutes = router;
