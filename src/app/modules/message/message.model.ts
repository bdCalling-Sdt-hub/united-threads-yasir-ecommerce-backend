import { model, Schema } from "mongoose";
import { TMessage } from "./message.interface";

const messageSchema = new Schema<TMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    text: { type: String, default: null },
    seen: { type: Boolean, default: false },
    file: [{ type: String, default: null }],
  },
  {
    timestamps: true,
  },
);

const MessageModel = model<TMessage>("Message", messageSchema);
export default MessageModel;
