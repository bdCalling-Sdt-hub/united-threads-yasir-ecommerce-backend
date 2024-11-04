import httpStatus from "http-status";
import { CustomRequest } from "../../types/common";
import catchAsync from "../../utils/catchAsync";
import { AiServices } from "./ai.service";
import sendResponse from "../../utils/sendResponse";

const createImage = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await AiServices.createImageIntoDb(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Image created successfully",
    data: result,
  });
});

export const AiController = {
  createImage,
};
