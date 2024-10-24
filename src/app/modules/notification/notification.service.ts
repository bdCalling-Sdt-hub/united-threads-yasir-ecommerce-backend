import { TNotification } from "./notification.interface";
import { NotificationModel } from "./notification.model";

const createNotificationIntoDb = async (data: TNotification) => {
  const result = await NotificationModel.create(data);
  return result;
};

const getNotificationFromDb = async (userId: string) => {
  const result = await NotificationModel.find({ receiver: userId }).lean();
  return result;
};

export const NotificationService = {
  createNotificationIntoDb,
  getNotificationFromDb,
};
