import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { PaymentServices } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";
import config from "../../config";

const createPayment = catchAsync(async (req, res) => {
  const result = await PaymentServices.createPaymentIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const createPaymentLink = catchAsync(async (req, res) => {
  const result = await PaymentServices.createPaymentLink(req.params.orderId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Link created successfully",
    data: result,
  });
});

const webhook = catchAsync(async (req, res) => {
  const { orderId, sessionId } = req.query;

  if (!sessionId) {
    throw new AppError(httpStatus.BAD_REQUEST, "stripe session id not found");
  }

  const result = await PaymentServices.verifyPaymentWithWebhook(
    sessionId as string,
    orderId as string,
  );
  res.redirect(`${config.payment.paymentSuccessUrl}/?orderId=${result?.order}`);
});

export const PaymentController = {
  createPayment,
  createPaymentLink,
  webhook,
};
