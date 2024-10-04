import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { TQuoteProduct } from "./quote-product.interface";
import { QuoteProductModel } from "./quote-product.model";

const createQuoteProductIntoDb = async (payload: TQuoteProduct) => {
  const result = await QuoteProductModel.create(payload);
  return result;
};

const getAllQuoteProductsFromDb = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(QuoteProductModel.find({ isDeleted: false }), query)
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
const getQuoteProductByIdFromDb = async (id: string) => {
  const product = await QuoteProductModel.findById(id);
  if (!product || product.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }
  return product;
};

// Update Product in Database
const updateQuoteProductIntoDb = async (productId: string, payload: Partial<TQuoteProduct>) => {
  const updatedProduct = await QuoteProductModel.findOneAndUpdate(
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
const deleteQuoteProductIntoDb = async (id: string) => {
  const deletedProduct = await QuoteProductModel.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!deletedProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
  }

  return deletedProduct;
};

const getProductQuoteCountBySize = async () => {
  const result = await QuoteProductModel.aggregate([
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

export const QuoteProductService = {
  createQuoteProductIntoDb,
  getAllQuoteProductsFromDb,
  getQuoteProductByIdFromDb,
  updateQuoteProductIntoDb,
  deleteQuoteProductIntoDb,
  getProductQuoteCountBySize,
};
