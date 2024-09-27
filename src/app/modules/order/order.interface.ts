import { Schema } from "mongoose";

export type TOrder = {
  _id?: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
  amount: number;
  status: TOrderStatus;
  orderType: TOrderType;
  paymentStatus: TPaymentStatus;
  duoAmount?: number;
  country: string;
  state: string;
  city: string;
  houseNo: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TOrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELED";

export type TOrderType = "SHOP" | "QUOTE";
export type TPaymentStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID";
