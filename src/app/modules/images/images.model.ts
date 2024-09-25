import { Schema, model } from "mongoose";
import { TImage } from "./images.interface";

// Define the schema for the image
const imageSchema = new Schema<TImage>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    url: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const ImageModel = model<TImage>("Image", imageSchema);

export default ImageModel;
