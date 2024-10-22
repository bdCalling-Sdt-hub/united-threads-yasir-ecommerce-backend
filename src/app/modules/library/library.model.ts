import { model, Schema } from "mongoose";
import { TLibrary } from "./library.interface";

const librarySchema = new Schema<TLibrary>({
  name: { type: String, default: null },
  image: { type: String, required: true },
  description: { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
});

const LibraryModel = model<TLibrary>("Library", librarySchema);
export default LibraryModel;