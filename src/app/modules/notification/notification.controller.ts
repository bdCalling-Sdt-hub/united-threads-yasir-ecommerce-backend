import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";
import { CustomRequest } from "../../types/common";

const createNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.createNotificationIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Notification created successfully",
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await NotificationService.getNotificationFromDb(user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications fetched successfully",
    data: result,
  });
});

export const NotificationController = {
  createNotification,
  getAllNotifications,
};
