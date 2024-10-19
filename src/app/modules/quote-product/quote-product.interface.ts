import { Schema } from "mongoose";
import { TProductSize } from "../product/product.interface";

export type TQuoteProduct = {
  _id: Schema.Types.ObjectId;
  name: string;
  frontSide: string;
  backSide: string;
  category: Schema.Types.ObjectId;
  colorsPreferences: string[];
  images: TImage[];
  size: TProductSize[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TImage = {
  url: string;
  key: string;
};
