import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TCategory } from "./category.interface";
import AppError from "../../errors/AppError";
import CategoryModel from "./category.model";
import QueryBuilder from "../../builder/QueryBuilder";

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

  const result = await CategoryModel.findOneAndUpdate(
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
  const categoryQuery = new QueryBuilder(CategoryModel.find({ isDeleted: false }), query)
    .search(["name"])
    .filter();
  const result = await categoryQuery.modelQuery;
  return result;
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
  const result = await CategoryModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );
  return result;
};

export const CategoryServices = {
  createCategoryIntoDb,
  getAllCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryIntoDb,
};
