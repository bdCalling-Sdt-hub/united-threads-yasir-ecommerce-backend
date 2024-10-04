import { model, Schema } from "mongoose";
import { TOrder } from "./order.interface";
import { ORDER_STATUS_ENUM, ORDER_TYPE_ENUM, PAYMENT_STATUS_ENUM } from "./order.constant";

const OrderSchema = new Schema<TOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    quote: { type: Schema.Types.ObjectId, ref: "Quote" },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ORDER_STATUS_ENUM,
      required: true,
      default: "PENDING",
    },
    orderType: {
      type: String,
      enum: ORDER_TYPE_ENUM,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_ENUM,
      required: true,
      default: "UNPAID",
    },
    duoAmount: { type: Number, default: 0 },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    houseNo: { type: String },
  },
  {
    timestamps: true,
  },
);

const OrderModel = model<TOrder>("Order", OrderSchema);

export default OrderModel;
