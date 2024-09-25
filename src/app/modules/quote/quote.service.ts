import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import AppError from "../../errors/AppError";
import QuoteModel from "./quote.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { TQuote } from "./quote.interface";

// Create Quote in Database
const createQuoteIntoDb = async (user: TTokenUser, payload: TQuote) => {
  const userData = await UserModel.findById(user._id).lean();

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // Create a new Quote in the database
  const result = await QuoteModel.create({ ...payload, user: userData._id });
  return result;
};

// Get All Quote from Database
const getAllQuotesFromDb = async (query: Record<string, unknown>) => {
  const quoteQuery = new QueryBuilder(QuoteModel.find({ isDeleted: false }), query)
    .search([
      "name",
      "description",
      "materialPreferences",
      "size",
      "price",
      "pantoneColor",
      "hexColor",
      "colorDuration",
    ])
    .filter();

  const quotes = await quoteQuery.modelQuery;
  const meta = await quoteQuery.countTotal();
  return {
    quotes,
    meta,
  };
};

// Get Product By ID
const getQuoteByIdFromDb = async (id: string) => {
  const quote = await QuoteModel.findById(id).populate("category").lean();
  if (!quote || quote.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Quote Not Found");
  }
  return quote;
};

// Update Quote in Database
const updateQuoteIntoDb = async (quoteId: string, payload: Partial<TQuote>) => {
  const updatedQuote = await QuoteModel.findOneAndUpdate(
    { _id: quoteId, isDeleted: false },
    { ...payload },
    { new: true, runValidators: true },
  );

  if (!updatedQuote) {
    throw new AppError(httpStatus.NOT_FOUND, "Quote Not Found");
  }

  return updatedQuote;
};

// Soft Delete Quote in Database
const deleteQuoteIntoDb = async (id: string) => {
  const deletedQuote = await QuoteModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!deletedQuote) {
    throw new AppError(httpStatus.NOT_FOUND, "Quote Not Found");
  }

  return deletedQuote;
};

export const QuoteServices = {
  createQuoteIntoDb,
  getAllQuotesFromDb,
  getQuoteByIdFromDb,
  updateQuoteIntoDb,
  deleteQuoteIntoDb,
};
