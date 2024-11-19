/* eslint-disable @typescript-eslint/no-explicit-any */
import config from "../../config";
import { stripe } from "../../constant/stripe";
import { TOrder } from "../order/order.interface";

const paymentLink = async (order: TOrder) => {
  const { _id } = order;
  if (!_id) {
    throw new Error("Order Not Found");
  }

  const paymentGatewayData = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: _id.toString(),
          },
          unit_amount: Number((order.amount * 100).toFixed(2)),
        },
        quantity: order.orderType === "SHOP" ? order.quantity : 1,
      },
    ],
    success_url: `${config.payment.webHookUrl}?sessionId={CHECKOUT_SESSION_ID}&orderId=${_id}`,
    cancel_url: `${config.payment.paymentCancelUrl}?orderId=${_id}`,
    mode: "payment",
    metadata: {
      order: JSON.stringify(order._id),
    },
    invoice_creation: {
      enabled: true,
    },
    payment_intent_data: {
      metadata: {
        order: JSON.stringify(order._id),
      },
    },
    payment_method_types: ["card", "cashapp", "amazon_pay", "us_bank_account"],

    // expire in 30 minutes
    //expires_at: new Date(Date.now() + 30 * 60 * 1000),
  });

  return paymentGatewayData;
};

const createPaymentLinkForQuoteOrder = async (order: TOrder, amount: number) => {
  const { _id } = order;
  if (!_id) {
    throw new Error("Order Not Found");
  }

  const paymentGatewayData = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: _id.toString(),
          },
          unit_amount: amount / 100,
        },
        quantity: order.quantity,
      },
    ],
    success_url: `${config.payment.webHookUrl}?sessionId={CHECKOUT_SESSION_ID}&orderId=${_id}`,
    cancel_url: `${config.payment.paymentCancelUrl}?orderId=${_id}`,
    mode: "payment",
    metadata: {
      order: JSON.stringify(order),
    },
    invoice_creation: {
      enabled: true,
    },
    payment_intent_data: {
      metadata: {
        order: JSON.stringify(order),
      },
    },
    payment_method_types: ["card"],

    // expire in 30 minutes
    //expires_at: new Date(Date.now() + 30 * 60 * 1000),
  });

  return paymentGatewayData;
};

const verifyPayment = async (sessionId: string) => {
  const response = await stripe.checkout.sessions.retrieve(sessionId);
  return response;
};

export const StripeServices = {
  paymentLink,
  verifyPayment,
  createPaymentLinkForQuoteOrder,
};
