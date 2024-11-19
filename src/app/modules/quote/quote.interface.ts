import { Schema } from "mongoose";
import { TProductSize } from "../product/product.interface";

export type TQuote = {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  name: string;
  frontSide: string;
  backSide: string;
  pantoneColor: string;
  category: Schema.Types.ObjectId;
  hexColor: string;
  quantity: number;
  price: number;
  size: TProductSize;
  country: string;
  state: string;
  city: string;
  houseNo?: string;
  area?: string;
  comment?: string;
  materialPreferences: string;
  sizesAndQuantities: TSizeAndQuantity[];
  isDeleted?: boolean;
  quoteStatus?: TQuoteStatus;
  isAccepted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  salesCount?: number;
};
export type TSizeAndQuantity = {
  size: TProductSize;
  quantity: number;
};

export type TQuoteStatus = "pending" | "processing" | "delivered" | "CANCELED";
