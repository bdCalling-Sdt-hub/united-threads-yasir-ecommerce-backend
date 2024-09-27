import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MetaServices } from "./meta.service";

const getUsersCount = catchAsync(async (req, res) => {
  const result = await MetaServices.getUsersCount(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users count fetched successfully",
    data: result,
  });
});

const getMonthlyRevenue = catchAsync(async (req, res) => {
  const result = await MetaServices.getMonthlyRevenue(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly revenue fetched successfully",
    data: result,
  });
});

const getMonthlyProductOrderQuantities = catchAsync(async (req, res) => {
  const result = await MetaServices.getMonthlyProductOrderQuantities(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly product order quantities fetched successfully",
    data: result,
  });
});

export const MetaController = {
  getUsersCount,
  getMonthlyRevenue,
  getMonthlyProductOrderQuantities,
};