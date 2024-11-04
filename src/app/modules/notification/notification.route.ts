import { Router } from "express";
import auth from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get(
  "/notifications",
  auth("ADMIN", "CSR", "CUSTOMER"),
  NotificationController.getAllNotifications,
);
router.patch("/seen", auth("ADMIN", "CSR", "CUSTOMER"), NotificationController.seenNotification);

export const NotificationRoutes = router;
