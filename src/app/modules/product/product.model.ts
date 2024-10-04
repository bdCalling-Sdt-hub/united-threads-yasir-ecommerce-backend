import { model, Schema } from "mongoose";
import { TProduct } from "./product.interface";
import { PRODUCT_SIZE_ENUM } from "./product.constant";
import { TImage } from "../quote-product/quote-product.interface";

export const ProductImageSchema = new Schema<TImage>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  {
    _id: false,
  },
);

const ProductSchema = new Schema<TProduct>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    images: [ProductImageSchema],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    size: [
      {
        type: String,
        enum: PRODUCT_SIZE_ENUM,
        required: true,
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const ProductModel = model<TProduct>("Product", ProductSchema);

export default ProductModel;
