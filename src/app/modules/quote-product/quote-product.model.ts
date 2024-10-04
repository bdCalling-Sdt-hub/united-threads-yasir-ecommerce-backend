import { model, Schema } from "mongoose";
import { TQuoteProduct } from "./quote-product.interface";

const QuoteProductSchema = new Schema<TQuoteProduct>(
  {
    name: { type: String, required: true },
    frontSide: { type: String, required: true },
    backSide: { type: String, required: true },
    pantoneColor: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "QuoteCategory", required: true },
    hexColor: { type: String, required: true },
    images: [{ type: String, ref: "Image" }],
    colorsPreferences: [{ type: String, required: true }],
    size: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
        required: true,
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const QuoteProductModel = model<TQuoteProduct>("QuoteProduct", QuoteProductSchema);
