/* eslint-disable @typescript-eslint/no-explicit-any */
import config from "../../config";
import { stripe } from "../../constant/stripe";
import { TOrder } from "../order/order.interface";

const paymentLink = async (order: TOrder) => {
  const { _id } = order;

  const paymentGatewayData = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: _id.toString(),
          },
          unit_amount: order.amount * 100,
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
};
