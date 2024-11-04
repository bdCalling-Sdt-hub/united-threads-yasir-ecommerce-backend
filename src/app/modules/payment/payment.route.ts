import { Router } from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidations } from "./payment.validation";

const router = Router();

router.get("/webhook", PaymentController.webhook);
router.get("/get-payment/:orderId", auth("ADMIN", "CUSTOMER"), PaymentController.getPayment);
router.post("/create-payment/:orderId", auth("CUSTOMER"), PaymentController.createPaymentLink);
router.post(
  "/create-quote-payment/:orderId",
  auth("CUSTOMER"),
  validateRequest(PaymentValidations.createQuotePaymentValidation),
  PaymentController.createPaymentForQuoteOrder,
);

//router.post(
//  "/create-payment",=
//  auth("CUSTOMER"),
//  validateRequest(PaymentValidations.createPaymentValidation),
//  PaymentController.createPayment,
//);

export const PaymentRoutes = router;
