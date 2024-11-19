import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TCategory } from "./category.interface";
import AppError from "../../errors/AppError";
import CategoryModel from "./category.model";
import QueryBuilder from "../../builder/QueryBuilder";
import ProductModel from "../product/product.model";
import QuoteCategoryModel from "../quote-category/quote-category.model";
import { shuffle } from "../../utils/makeArrayshuffle";

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

  const result = await CategoryModel.create({ ...payload, user: userData });
  return result;
};

const getAllCategoryFromDb = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(CategoryModel.find({ isDeleted: false }), query)
    .search(["name"])
    .filter()
    .fields();

  // Fetch the categories
  const categories = await categoryQuery.modelQuery.lean();

  // Add productCount to each category
  const categoriesWithProductCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await ProductModel.find({
        category: category._id,
        isDeleted: false,
      }).countDocuments();
      return { ...category, productCount };
    }),
  );

  return categoriesWithProductCount;
};

const updateCategoryIntoDb = async (categoryId: string, payload: Partial<TCategory>) => {
  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
  }

  const result = await CategoryModel.findOneAndUpdate(
    { _id: categoryId },
    { ...payload },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteCategoryIntoDb = async (id: string) => {
  const result = await CategoryModel.findOneAndDelete({ _id: id });
  return result;
};

const getAllTypeCategoriesFromDb = async () => {
  const categories = await CategoryModel.find({ isDeleted: false }).lean();
  const quoteCategories = await QuoteCategoryModel.find({ isDeleted: false }).lean();

  const allCategories = [
    ...categories.map((category) => ({
      ...category,
      type: "SHOP",
    })),
    ...quoteCategories.map((quoteCategory) => ({
      ...quoteCategory,
      type: "QUOTE",
    })),
  ];

  const shuffledCategories = shuffle(allCategories);
  return shuffledCategories;
};

export const CategoryServices = {
  createCategoryIntoDb,
  getAllCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryIntoDb,
  getAllTypeCategoriesFromDb,
};
