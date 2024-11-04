import { Schema } from "mongoose";

export type TCategory = {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  name: string;
  image: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
