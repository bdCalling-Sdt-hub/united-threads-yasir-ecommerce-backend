import { model, Schema } from "mongoose";
import { TNotification } from "./notification.interface";

const notificationSchema = new Schema<TNotification>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    seen: { type: Boolean, default: false },
    notificationFor: { type: String, enum: ["ADMIN", "CSR", "CUSTOMER"] },
    type: { type: String, enum: ["PAYMENT", "ORDER", "QUOTE", "MESSAGE"], required: true },
  },
  {
    timestamps: true,
  },
);

export const NotificationModel = model<TNotification>("Notification", notificationSchema);
