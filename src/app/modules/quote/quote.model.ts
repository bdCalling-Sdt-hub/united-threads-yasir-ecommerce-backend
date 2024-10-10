import { model, Schema } from "mongoose";
import { TQuote } from "./quote.interface";

const QuoteSchema = new Schema<TQuote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "QuoteCategory", required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      required: true,
    },
    frontSide: { type: String, required: true },
    backSide: { type: String, required: true },
    pantoneColor: { type: String, required: true },
    hexColor: { type: String, required: true },
    materialPreferences: { type: String, required: true },
    quoteStatus: {
      type: String,
      enum: ["pending", "processing", "delivered", "canceled"],
      default: "pending",
    },
    isAccepted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
const QuoteModel = model<TQuote>("Quote", QuoteSchema);

export default QuoteModel;
