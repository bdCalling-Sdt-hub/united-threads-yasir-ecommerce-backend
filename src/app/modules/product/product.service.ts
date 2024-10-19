import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TProduct } from "./product.interface";
import AppError from "../../errors/AppError";
import ProductModel from "./product.model";
import QueryBuilder from "../../builder/QueryBuilder";
import OrderModel from "../order/order.model";
import ReviewModel from "../review/review.model";

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
  const correctQuery: Record<string, unknown> = {};
  Object.keys(query).forEach((key) => {
    if (query[key]) {
      correctQuery[key] = query[key];
    }
  });

  // Initialize the query builder
  let productQuery = new QueryBuilder(
    ProductModel.find({ isDeleted: false }).populate("category"),
    correctQuery,
  ).search(["name", "description", "shortDescription"]);

  // Handle filtering by size if it's provided in the query
  if (correctQuery.size) {
    productQuery = productQuery.filterFromArray("size", correctQuery.size as string[]);
    // Remove 'size' from the main correctQuery to avoid double filtering
    delete correctQuery.size;
  }

  // Apply generic filtering, sorting, pagination, and field selection
  productQuery = productQuery
    .filter() // Apply filters from correctQuery
    .sort()
    .paginate()
    .fields();

  const products = await productQuery.modelQuery;

  const productsWithSalesCount = await Promise.all(
    products.map(async (product) => {
      const orderCount =
        (await OrderModel.find({
          product: product._id,
          paymentStatus: "PAID",
        }).countDocuments()) || 0;
      const reviews = await ReviewModel.find({ product: product._id });
      const averageRating =
        reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) / reviews.length || 0;
      return {
        ...product.toObject(),
        orderCount,
        averageRating,
        totalReviews: reviews.length,
      }; // toObject() converts Mongoose document to plain object
    }),
  );

  const meta = await productQuery.countTotal();
  return { products: productsWithSalesCount, meta };
};

// Get Product By ID
const getProductByIdFromDb = async (id: string) => {
  const product = await ProductModel.findById(id).populate("user category").lean();
  if (!product || product.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }

  const reviews = await ReviewModel.find({ product: product._id });
  const averageRating =
    reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) / reviews.length || 0;

  const result = {
    ...product,
    totalReviews: reviews.length,
    averageRating,
  };

  return result;
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

const getProductCountBySize = async () => {
  const result = await ProductModel.aggregate([
    {
      // Unwind the size array so that each size in the array is treated as a separate document
      $unwind: "$size",
    },
    {
      // Match to exclude deleted products
      $match: {
        isDeleted: false,
      },
    },
    {
      // Group by the size and count how many products have that size
      $group: {
        _id: "$size",
        productCount: { $sum: 1 },
      },
    },
  ]);

  // Transform result into the desired format
  const formattedResult = result.reduce((acc, item) => {
    acc[item._id] = { productCount: item.productCount };
    return acc;
  }, {});

  return formattedResult;
};

export const ProductServices = {
  createProductIntoDb,
  getAllProductsFromDb,
  getProductByIdFromDb,
  updateProductIntoDb,
  deleteProductIntoDb,
  getProductCountBySize,
};
