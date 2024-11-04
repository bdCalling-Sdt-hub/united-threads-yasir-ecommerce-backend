import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ImageServices } from "./images.service";

const uploadImages = catchAsync(async (req, res) => {
  const productId = req.params.id;
  const result = await ImageServices.uploadImagesIntoDb(productId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image uploaded successfully",
    data: result,
  });
});

export const ImageController = {
  uploadImages,
};
