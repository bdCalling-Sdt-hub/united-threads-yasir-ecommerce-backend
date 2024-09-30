/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { PAYMENT_STATUS } from "../order/order.constant";
import OrderModel from "../order/order.model";
import { StripeServices } from "../stripe/stripe.service";
import { TPayment } from "./payment.interface";
import { PaymentModel } from "./payment.model";
import { sendMail } from "../../utils/sendMail";
import path from "path";
import fs from "fs";
import moment from "moment";

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

    const orderDetails: any = await OrderModel.findByIdAndUpdate(orderId, {
      paymentStatus: PAYMENT_STATUS.PAID,
    })
      .populate("user product")
      .session(session);

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

    const parentMailTemplate = path.join(process.cwd(), "/src/template/invoice.html");
    const invoiceEmail = fs.readFileSync(parentMailTemplate, "utf-8");
    const html = invoiceEmail
      .replace(/{{name}}/g, orderDetails?.user?.firstName as string)
      .replace(/{{product_name}}/g, orderDetails?.product?.name)
      .replace(/{{date}}/g, moment(new Date()).format("DD MMMM YYYY hh:mm A"))
      .replace(/{{amount}}/g, orderDetails?.amount)
      .replace(/{{total}}/g, orderDetails?.amount)
      .replace(/{{support_url}}/g, "mailto:masumraihan3667@gmail.com");
    sendMail({ to: orderDetails?.user.email, html, subject: "Invoice From United Threads" });

    await session.commitTransaction();
    await session.endSession();

    return {
      orderId: paymentData?.order,
      sessionId,
    };
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
