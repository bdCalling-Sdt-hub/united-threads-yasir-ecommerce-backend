import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { QuoteProductService } from "./quote-product.service";

const createQuoteProduct = catchAsync(async (req, res) => {
  const result = await QuoteProductService.createQuoteProductIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Quote product created successfully",
    data: result,
  });
});

const getAllQuoteProduct = catchAsync(async (req, res) => {
  const result = await QuoteProductService.getAllQuoteProductsFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote product fetched successfully",
    data: result,
  });
});

const getQuoteProductById = catchAsync(async (req, res) => {
  const result = await QuoteProductService.getQuoteProductByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote product fetched successfully",
    data: result,
  });
});

const updateQuoteProduct = catchAsync(async (req, res) => {
  const quoteProductId = req.params.id;
  const result = await QuoteProductService.updateQuoteProductIntoDb(quoteProductId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote product updated successfully",
    data: result,
  });
});

const deleteQuoteProduct = catchAsync(async (req, res) => {
  const quoteProductId = req.params.id;
  const result = await QuoteProductService.deleteQuoteProductIntoDb(quoteProductId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote product deleted successfully",
    data: result,
  });
});

const getQuoteProductsCountBySize = catchAsync(async (req, res) => {
  const result = await QuoteProductService.getProductQuoteCountBySize();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote products count fetched successfully",
    data: result,
  });
});

export const QuoteProductController = {
  createQuoteProduct,
  getAllQuoteProduct,
  getQuoteProductById,
  updateQuoteProduct,
  deleteQuoteProduct,
  getQuoteProductsCountBySize,
};
