import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import { CustomRequest, TTokenUser } from "../../types/common";

const getAllUser = catchAsync(async (req, res) => {
  const { users, meta } = await UserServices.getAllUsersFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    meta,
    data: users,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserServices.getSingleUserFromDb(req.params.slug);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await UserServices.updateUser(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteMyProfile = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user as TTokenUser;
  const result = await UserServices.deleteMyProfileFromDb(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile deleted successfully",
    data: result,
  });
});

const getProfile = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await UserServices.getUserProfileFromDb(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await UserServices.updateUserIntoDb(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await UserServices.deleteUserFromDb(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const sendMailIntoAdmin = catchAsync(async (req, res) => {
  const result = await UserServices.sendMailIntoAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Mail sent successfully",
    data: result,
  });
});

export const UserControllers = {
  getAllUser,
  getSingleUser,
  updateUser,
  deleteMyProfile,
  getProfile,
  updateProfile,
  deleteUser,
  sendMailIntoAdmin,
};
