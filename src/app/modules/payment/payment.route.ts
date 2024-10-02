import { Router } from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.get("/webhook", PaymentController.webhook);

router.post("/create-payment/:orderId", auth("CUSTOMER"), PaymentController.createPaymentLink);

router.get("/get-payment/:orderId", auth("ADMIN", "CUSTOMER"), PaymentController.getPayment);

//router.post(
//  "/create-payment",=
//  auth("CUSTOMER"),
//  validateRequest(PaymentValidations.createPaymentValidation),
//  PaymentController.createPayment,
//);

export const PaymentRoutes = router;
