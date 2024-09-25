import { Schema } from "mongoose";

export type TImage = {
  _id: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  url: string[];
  createdAt: Date;
  updatedAt: Date;
};
