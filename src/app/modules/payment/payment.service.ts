/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { PAYMENT_STATUS } from "../order/order.constant";
import OrderModel from "../order/order.model";
import { StripeServices } from "../stripe/stripe.service";
import { TPayment } from "./payment.interface";
import { PaymentModel } from "./payment.model";

const createPaymentIntoDb = async (payload: TPayment) => {
  console.log(payload);
};

const createPaymentLink = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  const paymentLink = await StripeServices.paymentLink(order);
  return {
    paymentLink: paymentLink.url,
  };
};

const verifyPaymentWithWebhook = async (sessionId: string, orderId: string) => {
  const payment = await StripeServices.verifyPayment(sessionId);

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment Data Not Found");
  }

  if (payment.id !== sessionId || orderId !== orderId) {
    throw new AppError(httpStatus.NOT_FOUND, "Failed to Verify Payment");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await OrderModel.findByIdAndUpdate(orderId, {
      paymentStatus: PAYMENT_STATUS.PAID,
    }).session(session);

    const paymentData = await PaymentModel.findOneAndUpdate(
      {
        order: orderId,
      },
      {
        amount: payment.amount_total,
        paymentGateway: JSON.stringify(payment),
        status: PAYMENT_STATUS.PAID,
      },
    ).session(session);

    await session.commitTransaction();
    await session.endSession();

    return paymentData;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

export const PaymentServices = {
  createPaymentIntoDb,
  createPaymentLink,
  verifyPaymentWithWebhook,
};
