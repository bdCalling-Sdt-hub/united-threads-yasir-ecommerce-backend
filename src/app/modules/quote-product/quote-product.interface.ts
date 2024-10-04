import { Schema } from "mongoose";
import { TProductSize } from "../product/product.interface";

export type TQuoteProduct = {
  _id: Schema.Types.ObjectId;
  name: string;
  frontSide: string;
  backSide: string;
  pantoneColor: string;
  category: Schema.Types.ObjectId;
  colorsPreferences: string[];
  hexColor: string;
  images: string[];
  size: TProductSize[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
