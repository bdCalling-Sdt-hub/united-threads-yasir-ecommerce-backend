/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import httpStatus from "http-status";
import moment from "moment-timezone";
import mongoose from "mongoose";
import path from "path";
import AppError from "../../errors/AppError";
import { sendMail } from "../../utils/sendMail";
import { TNotification } from "../notification/notification.interface";
import { NotificationServices } from "../notification/notification.service";
import { PAYMENT_STATUS } from "../order/order.constant";
import { TOrder } from "../order/order.interface";
import OrderModel from "../order/order.model";
import ProductModel from "../product/product.model";
import { StripeServices } from "../stripe/stripe.service";
import { TPayment } from "./payment.interface";
import { PaymentModel } from "./payment.model";
import { io } from "../../../server";
import { QuoteProductModel } from "../quote-product/quote-product.model";
import UserModel from "../user/user.model";
import { USER_ROLE } from "../user/user.constant";
import config from "../../config";

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

const createPaymentForQuoteOrderIntoDb = async (orderId: string, payload: { amount: number }) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  const paymentLink = await StripeServices.createPaymentLinkForQuoteOrder(order, payload.amount);

  return {
    paymentLink: paymentLink.url,
  };
};

const verifyPaymentWithWebhook = async (sessionId: string, orderId: string) => {
  const payment = await StripeServices.verifyPayment(sessionId);
  const orderData = await OrderModel.findById(orderId);

  if (!orderData) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Data Not Found");
  }
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment Data Not Found");
  }

  if (payment.status !== "complete") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment is not succeeded");
  }

  if (payment.id !== sessionId || orderId !== orderId) {
    throw new AppError(httpStatus.NOT_FOUND, "Failed to Verify Payment");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const orderPayload: Partial<TOrder> = {
      paymentStatus: PAYMENT_STATUS.PAID,
    };

    if (payment.amount_total && payment?.amount_total < orderData.amount) {
      orderPayload.duoAmount = payment?.amount_total - orderData.amount;
    }

    const orderDetails: any = await OrderModel.findByIdAndUpdate(orderId, orderPayload)
      .populate("user product quote")
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

    if (orderDetails?.quote) {
      await QuoteProductModel.updateOne(
        {
          _id: orderDetails?.quote,
        },
        {
          stock: orderDetails?.quote?.stock - 1,
        },
      ).session(session);
    } else if (orderDetails?.product) {
      await ProductModel.updateOne(
        {
          _id: orderDetails?.product,
        },
        {
          stock: orderDetails?.product?.stock - 1,
          salesCount: orderDetails?.product?.salesCount + 1,
        },
      ).session(session);
    }

    const parentMailTemplate = path.join(process.cwd(), "/src/template/invoice.html");
    const invoiceEmail = fs.readFileSync(parentMailTemplate, "utf-8");
    const html = invoiceEmail
      .replace(/{{name}}/g, orderDetails?.user?.firstName as string)
      .replace(
        /{{product_name}}/g,
        orderDetails.orderType === "QUOTE"
          ? orderDetails?.quote?.name || "Quote"
          : orderDetails?.product?.name || "Product",
      )
      .replace(
        /{{date}}/g,
        moment.utc(new Date()).tz("America/New_York").format("DD MMMM YYYY hh:mm A"),
      )
      .replace(
        /{{amount}}/g,
        orderData.orderType === "QUOTE"
          ? orderDetails?.amount
          : orderDetails?.amount * orderDetails?.quantity,
      )
      .replace(
        /{{total}}/g,
        orderData.orderType === "QUOTE"
          ? orderDetails?.amount
          : orderDetails?.amount * orderDetails?.quantity,
      )
      .replace(/{{support_url}}/g, `mailto:${config.email.host}`);
    sendMail({ to: orderDetails?.user.email, html, subject: "Invoice From United Threads" });

    // after payment success create a notification and emit event
    const notificationPayload: TNotification = {
      title: "Payment Success",
      message: "Your payment is successful",
      receiver: orderDetails?.user?._id,
      type: "PAYMENT",
    };

    io.emit(`notification::${orderDetails?.user?._id}`, {
      success: true,
      data: notificationPayload,
    });
    await NotificationServices.createNotificationIntoDb(notificationPayload);
    const admin = await UserModel.findOne({ role: USER_ROLE.ADMIN });

    if (admin) {
      const adminNotificationPayload: TNotification = {
        title: "Payment Success",
        message: `Send $${orderDetails?.amount} for order $${orderDetails?._id}`,
        receiver: admin._id,
        type: "PAYMENT",
      };
      io.emit(`notification::${admin._id}`, {
        success: true,
        data: notificationPayload,
      });
      await NotificationServices.createNotificationIntoDb(adminNotificationPayload);
    }

    await session.commitTransaction();
    await session.endSession();

    return {
      orderId: paymentData?.order,
      sessionId,
    };
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    StripeServices.refundPayment(payment.payment_intent as string);
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getPaymentFromDb = async (orderId: string) => {
  const paymentData = await PaymentModel.findOne({ order: orderId }).lean();
  return paymentData;
};

export const PaymentServices = {
  createPaymentIntoDb,
  createPaymentLink,
  verifyPaymentWithWebhook,
  getPaymentFromDb,
  createPaymentForQuoteOrderIntoDb,
};
