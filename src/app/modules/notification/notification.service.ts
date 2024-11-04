import { io } from "../../../server";
import QueryBuilder from "../../builder/QueryBuilder";
import { TNotification } from "./notification.interface";
import { NotificationModel } from "./notification.model";

const createNotificationIntoDb = async (data: TNotification) => {
  const result = await NotificationModel.create(data);
  return result;
};

const getNotificationFromDb = async (userId: string, query: Record<string, unknown>) => {
  const notificationQuery = new QueryBuilder(
    NotificationModel.find({ receiver: userId, seen: false }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await notificationQuery.countTotal();
  const notifications = await notificationQuery.modelQuery;

  const result = { notifications, meta };
  return result;
};

const seenNotificationIntoDb = async (userId: string) => {
  const result = await NotificationModel.updateMany(
    { receiver: userId, seen: false },
    { seen: true },
  );

  if (result.modifiedCount) {
    io.emit(`notification::${userId}`, { success: true, data: {}, meta: { total: 0 } });
  }

  await NotificationModel.deleteMany({
    receiver: userId,
    seen: true,
  });

  return result;
};

export const NotificationServices = {
  createNotificationIntoDb,
  getNotificationFromDb,
  seenNotificationIntoDb,
};
