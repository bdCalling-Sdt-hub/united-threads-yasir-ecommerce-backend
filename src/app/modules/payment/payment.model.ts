import { model, Schema } from "mongoose";
import { TPayment } from "./payment.interface";
import { PAYMENT_STATUS_ENUM } from "../order/order.constant";

const PaymentSchema = new Schema<TPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    paymentGateway: { type: String, default: null },
    status: {
      type: String,
      enum: PAYMENT_STATUS_ENUM,
      default: "UNPAID",
    },
  },
  {
    timestamps: true,
  },
);

export const PaymentModel = model<TPayment>("Payment", PaymentSchema);
