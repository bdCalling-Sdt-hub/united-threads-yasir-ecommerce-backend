import Stripe from "stripe";
import config from "../config";

export const stripe = new Stripe(config.payment.secretKey!, {
  apiVersion: "2024-06-20",
  typescript: true,
});
