import { model, Schema } from "mongoose";
import { TChat, TParticipant } from "./chat.interface";

const ChatParticipantSchema = new Schema<TParticipant>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  isBlocked: { type: Boolean, default: false },
});

const ChatSchema = new Schema<TChat>(
  {
    participants: [ChatParticipantSchema],
  },
  {
    timestamps: true,
  },
);

export const ChatModel = model<TChat>("Chat", ChatSchema);
