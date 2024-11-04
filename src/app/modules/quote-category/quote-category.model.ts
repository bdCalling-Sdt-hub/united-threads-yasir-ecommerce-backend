import { model, Schema } from "mongoose";
import { TCategory } from "./quote-category.interface";

const CategorySchema = new Schema<TCategory>(
  {
    name: { type: String, required: true },
    image: { type: String, default: null },
    description: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const QuoteCategoryModel = model<TCategory>("QuoteCategory", CategorySchema);
export default QuoteCategoryModel;
