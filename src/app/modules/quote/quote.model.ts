import { model, Schema } from "mongoose";
import { TQuote } from "./quote.interface";

const sizesAndQuantitiesSchema = new Schema({
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    required: true,
  },
  quantity: { type: Number, required: true },
});

const QuoteSchema = new Schema<TQuote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "QuoteCategory", required: true },
    //quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    //size: {
    //  type: String,
    //  enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    //  required: true,
    //},
    frontSide: { type: String, required: true },
    backSide: { type: String, required: true },
    pantoneColor: { type: String, required: true },
    hexColor: { type: String, required: true },
    materialPreferences: { type: String, required: true },
    area: { type: String },
    country: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    houseNo: { type: String },
    comment: { type: String },
    sizesAndQuantities: [sizesAndQuantitiesSchema],
    quoteStatus: {
      type: String,
      enum: ["pending", "processing", "delivered", "canceled"],
      default: "pending",
    },
    salesCount: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
const QuoteModel = model<TQuote>("Quote", QuoteSchema);

export default QuoteModel;
