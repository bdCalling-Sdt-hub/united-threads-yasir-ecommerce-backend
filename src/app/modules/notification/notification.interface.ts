import { Schema } from "mongoose";

export type TNotification = {
  _id?: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  title: string;
  message: string;
  link?: string;
  seen?: boolean;
  type: "PAYMENT" | "ORDER" | "QUOTE" | "MESSAGE";
  createdAt?: Date;
  updatedAt?: Date;
};
