/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFoundHandler from "./app/middlewares/notFoundHandler";
import router from "./app/routes";
import cron from "node-cron";
import { OrderServices } from "./app/modules/order/order.services";

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

// cron job for every 5 minutes
cron.schedule("*/5 * * * *", () => {
  OrderServices.deleteUnpaidOrder();
});

// run every day at 00:00
cron.schedule("0 0 * * *", () => {
  OrderServices.deleteUnpaidOrder();
});

app.use(globalErrorHandler);

// not found handler
app.use(notFoundHandler);

export default app;
