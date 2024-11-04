import { model, Schema } from "mongoose";
import { TQuoteProduct } from "./quote-product.interface";
import { PRODUCT_SIZE_ENUM } from "../product/product.constant";

export const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  {
    _id: false,
  },
);

const QuoteProductSchema = new Schema<TQuoteProduct>(
  {
    name: { type: String, required: true },
    frontSide: { type: String, required: true },
    backSide: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "QuoteCategory", required: true },
    images: [ProductImageSchema],
    colorsPreferences: [{ type: String }],
    size: [
      {
        type: String,
        enum: PRODUCT_SIZE_ENUM,
        required: true,
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const QuoteProductModel = model<TQuoteProduct>("QuoteProduct", QuoteProductSchema);
