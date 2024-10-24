import { Router } from "express";
import auth from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get(
  "/notifications",
  auth("ADMIN", "CSR", "CUSTOMER"),
  NotificationController.getAllNotifications,
);

export const NotificationRoutes = router;
