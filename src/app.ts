/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundHandler from "./app/middlewares/notFoundHandler";
import router from "./app/routes";
import cron from "node-cron";
import { OrderServices } from "./app/modules/order/order.services";
import { UserServices } from "./app/modules/user/user.service";
import { TNotification } from "./app/modules/notification/notification.interface";
import { Schema } from "mongoose";
import { io } from "./server";
import UserModel from "./app/modules/user/user.model";
import { NotificationServices } from "./app/modules/notification/notification.service";

const app: Application = express();

// parser
app.use(express.json());
app.use(
  cors({
    origin: [
      "*",
      "http://localhost:3005",
      "http://localhost:5010",
      "http://172.16.0.2:5010",
      "http://localhost:3000",
      "https://dashboard.theunitedthreads.com",
      "https://theunitedthreads.com",
      "https://www.dashboard.theunitedthreads.com",
      "https://www.theunitedthreads.com",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/", async (req: Request, res: Response) => {
  res.send({ message: "Server is Running" });
});

// routes
app.use("/api/v1", router);

// Cron job to delete unpaid orders every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    await OrderServices.deleteUnpaidOrder();
    console.log("Unpaid orders deleted successfully.");
  } catch (error) {
    console.error("Error deleting unpaid orders:", error);
  }
});

// Cron job to send a notification every 10 seconds
//cron.schedule("*/10 * * * * *", async () => {
//  try {
//    const csrId = await UserModel.findOne({ role: "ADMIN" }).select("_id").lean();

//    if (csrId) {
//      const notification: TNotification = {
//        title: "Unpaid Orders",
//        message: "There are unpaid orders. Please pay them.",
//        receiver: csrId as any,
//        type: "ORDER",
//      };
//      io.emit(`notification::${csrId._id.toString()}`, {
//        success: true,
//        data: notification,
//      });

//      await NotificationServices.createNotificationIntoDb(notification);
//    }
//  } catch (error) {
//    console.log(error);
//  }
//});

// run every day at 00:00
cron.schedule("0 0 * * *", () => {
  OrderServices.deleteUnpaidOrder();
});

app.use(globalErrorHandler);

// not found handler
app.use(notFoundHandler);

export default app;
