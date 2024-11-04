import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { QuoteCategoryServices } from "./quote-category.service";
import { CustomRequest } from "../../types/common";

const createCategory = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await QuoteCategoryServices.createCategoryIntoDb(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await QuoteCategoryServices.getAllCategoryFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const categoryId = req.params.id;
  const result = await QuoteCategoryServices.updateCategoryIntoDb(categoryId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const result = await QuoteCategoryServices.deleteCategoryIntoDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const QuoteCategoryController = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
