import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import { QuoteProductModel } from "../quote-product/quote-product.model";
import UserModel from "../user/user.model";
import { TCategory } from "./quote-category.interface";
import { default as QuoteCategoryModel } from "./quote-category.model";

const createCategoryIntoDb = async (user: TTokenUser, payload: TCategory) => {
  const userData = await UserModel.findById(user._id).select("+password").lean();
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }
  if (!userData.validation?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account is not verified");
  }

  const result = await QuoteCategoryModel.findOneAndUpdate(
    {
      name: payload.name,
    },
    { ...payload, user: userData },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );
  return result;
};

const getAllCategoryFromDb = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(QuoteCategoryModel.find({ isDeleted: false }), query)
    .search(["name"])
    .filter()
    .fields();

  // Fetch the categories
  const categories = await categoryQuery.modelQuery.lean();

  // Add productCount to each category
  const categoriesWithProductCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await QuoteProductModel.find({
        category: category._id,
      }).countDocuments();
      return { ...category, productCount };
    }),
  );

  return categoriesWithProductCount;
};

const updateCategoryIntoDb = async (categoryId: string, payload: Partial<TCategory>) => {
  const category = await QuoteCategoryModel.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
  }

  const result = await QuoteCategoryModel.findOneAndUpdate(
    { _id: categoryId },
    { ...payload },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteCategoryIntoDb = async (id: string) => {
  const result = await QuoteCategoryModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );
  return result;
};

export const QuoteCategoryServices = {
  createCategoryIntoDb,
  getAllCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryIntoDb,
};
