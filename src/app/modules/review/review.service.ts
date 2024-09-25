import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TReview } from "./review.interface";
import AppError from "../../errors/AppError";
import ReviewModel from "./review.model";
import QueryBuilder from "../../builder/QueryBuilder";
import ProductModel from "../product/product.model";

// Create Review in Database
const createReviewIntoDb = async (user: TTokenUser, payload: TReview) => {
  const userData = await UserModel.findById(user._id).lean();

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  const productData = await ProductModel.findById(payload.product);
  if (!productData) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }

  // Create a new review in the database
  const result = await ReviewModel.create({ ...payload, user: userData._id });
  return result;
};

// Get All Reviews from Database
const getAllReviewsFromDb = async (query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(ReviewModel.find(), query).search(["comment"]).filter();

  const reviews = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { reviews, meta };
};

// Get Review By ID
const getReviewByIdFromDb = async (id: string) => {
  const review = await ReviewModel.findById(id).populate("user product");
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review Not Found");
  }
  return review;
};

// Update Review in Database
const updateReviewIntoDb = async (reviewId: string, payload: Partial<TReview>) => {
  const updatedReview = await ReviewModel.findOneAndUpdate(
    { _id: reviewId },
    { ...payload },
    { new: true, runValidators: true },
  );

  if (!updatedReview) {
    throw new AppError(httpStatus.NOT_FOUND, "Review Not Found");
  }

  return updatedReview;
};

const deleteReviewIntoDb = async (id: string) => {
  const deletedReview = await ReviewModel.findByIdAndDelete(id);

  if (!deletedReview) {
    throw new AppError(httpStatus.NOT_FOUND, "Review Not Found");
  }

  return deletedReview;
};

export const ReviewServices = {
  createReviewIntoDb,
  getAllReviewsFromDb,
  getReviewByIdFromDb,
  updateReviewIntoDb,
  deleteReviewIntoDb,
};
