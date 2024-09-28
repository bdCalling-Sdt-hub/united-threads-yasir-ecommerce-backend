import { Schema } from "mongoose";

export type TMessage = {
  _id?: Schema.Types.ObjectId;
  text?: string;
  file?: string;
  seen?: boolean;
  sender: Schema.Types.ObjectId;
  chat: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};
