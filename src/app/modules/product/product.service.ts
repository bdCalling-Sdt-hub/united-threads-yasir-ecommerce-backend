import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TProduct } from "./product.interface";
import AppError from "../../errors/AppError";
import ProductModel from "./product.model";
import QueryBuilder from "../../builder/QueryBuilder";

// Create Product in Database
const createProductIntoDb = async (user: TTokenUser, payload: TProduct) => {
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

  // Create a new product in the database
  const result = await ProductModel.create({ ...payload, user: userData._id });
  return result;
};

// Get All Products from Database
const getAllProductsFromDb = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(ProductModel.find({ isDeleted: false }), query)
    .search(["name", "description", "shortDescription", "size"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const products = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();
  return { products, meta };
};

// Get Product By ID
const getProductByIdFromDb = async (id: string) => {
  const product = await ProductModel.findById(id);
  if (!product || product.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }
  return product;
};

// Update Product in Database
const updateProductIntoDb = async (productId: string, payload: Partial<TProduct>) => {
  const updatedProduct = await ProductModel.findOneAndUpdate(
    { _id: productId, isDeleted: false },
    { ...payload },
    { new: true, runValidators: true },
  );

  if (!updatedProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }

  return updatedProduct;
};

// Soft Delete Product in Database
const deleteProductIntoDb = async (id: string) => {
  const deletedProduct = await ProductModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!deletedProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }

  return deletedProduct;
};

export const ProductServices = {
  createProductIntoDb,
  getAllProductsFromDb,
  getProductByIdFromDb,
  updateProductIntoDb,
  deleteProductIntoDb,
};
