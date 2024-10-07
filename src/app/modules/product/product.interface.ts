import { Schema } from "mongoose";
import { TImage } from "../quote-product/quote-product.interface";

export type TProduct = {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  name: string;
  description: string;
  shortDescription?: string;
  images: TImage[];
  primaryImage: string;
  category: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  size: TProductSize[];
  colorsPreferences: string[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
