import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationServices } from "./notification.service";
import { CustomRequest } from "../../types/common";

const createNotification = catchAsync(async (req, res) => {
  const result = await NotificationServices.createNotificationIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Notification created successfully",
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const { meta, notifications } = await NotificationServices.getNotificationFromDb(
    user._id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications fetched successfully",
    meta,
    data: notifications,
  });
});

const seenNotification = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await NotificationServices.seenNotificationIntoDb(user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification seen successfully",
    data: result,
  });
});

export const NotificationController = {
  createNotification,
  getAllNotifications,
  seenNotification,
};
