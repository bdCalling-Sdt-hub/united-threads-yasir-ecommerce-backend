import { Schema } from "mongoose";

export type TProduct = {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  name: string;
  image: string;
  description: string;
  shortDescription?: string;
  images: Schema.Types.ObjectId;
  category: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  size: TProductSize;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
