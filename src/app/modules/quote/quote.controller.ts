import httpStatus from "http-status";
import { CustomRequest, TTokenUser } from "../../types/common";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { QuoteServices } from "./quote.service";

const createQuote = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await QuoteServices.createQuoteIntoDb(user as TTokenUser, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Quote created successfully",
    data: result,
  });
});

const getAllQuote = catchAsync(async (req, res) => {
  const { meta, quotes } = await QuoteServices.getAllQuotesFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote fetched successfully",
    meta,
    data: quotes,
  });
});

const getQuoteById = catchAsync(async (req, res) => {
  const result = await QuoteServices.getQuoteByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote fetched successfully",
    data: result,
  });
});

const updateQuote = catchAsync(async (req, res) => {
  const quoteId = req.params.id;
  const result = await QuoteServices.updateQuoteIntoDb(quoteId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote updated successfully",
    data: result,
  });
});

const deleteQuote = catchAsync(async (req, res) => {
  const quoteId = req.params.id;
  const result = await QuoteServices.deleteQuoteIntoDb(quoteId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote deleted successfully",
    data: result,
  });
});

const getMyQuotes = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const { meta, quotes } = await QuoteServices.getMyQuotesFromDb(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My quotes fetched successfully",
    meta,
    data: quotes,
  });
});

const acceptQuote = catchAsync(async (req, res) => {
  const quoteId = req.params.id;
  const user = (req as CustomRequest).user;
  const result = await QuoteServices.acceptQuoteIntoDb(quoteId, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quote accepted successfully",
    data: result,
  });
});

export const QuoteController = {
  createQuote,
  getAllQuote,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getMyQuotes,
  acceptQuote,
};
