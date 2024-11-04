import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TReview } from "./review.interface";
import AppError from "../../errors/AppError";
import ReviewModel from "./review.model";
import QueryBuilder from "../../builder/QueryBuilder";
import ProductModel from "../product/product.model";
import mongoose from "mongoose";

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

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await ReviewModel.create([{ ...payload, user: userData._id }], {
      session,
    });

    const allReviews = await ReviewModel.find({
      product: productData._id,
    });

    const avgRating =
      allReviews.map((review) => review.rating).reduce((a, b) => a + b, 0) / allReviews.length || 0;

    const updateProduct = await ProductModel.findOneAndUpdate(
      {
        _id: payload.product,
      },
      {
        rating: avgRating,
        totalReviews: allReviews.length,
      },
      {
        new: true,
        session,
      },
    );
    if (!updateProduct) {
      throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
    }

    // Create a new review in the database
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to Create Review");
  }
};

// Get All Reviews from Database
const getAllReviewsFromDb = async (query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(ReviewModel.find().populate("user"), query)
    .search(["comment"])
    .filter()
    .sort()
    .fields();

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
