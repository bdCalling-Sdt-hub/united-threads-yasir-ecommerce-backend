import { Schema } from "mongoose";

export type TReview = {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
};
