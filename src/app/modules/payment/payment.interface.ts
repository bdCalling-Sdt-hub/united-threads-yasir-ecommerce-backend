import { Schema } from "mongoose";
import { TPaymentStatus } from "../order/order.interface";

export type TPayment = {
  _id?: Schema.Types.ObjectId;
  order: Schema.Types.ObjectId;
  amount: number;
  status: TPaymentStatus;
  paymentGateway?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
