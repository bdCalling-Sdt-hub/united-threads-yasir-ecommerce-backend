import httpStatus from "http-status";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { TOrder } from "./order.interface";
import AppError from "../../errors/AppError";
import OrderModel from "./order.model";
import QueryBuilder from "../../builder/QueryBuilder";

// Create Order in Database
const createOrderIntoDb = async (user: TTokenUser, payload: TOrder) => {
  const userData = await UserModel.findById(user._id).lean();

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

  // Create a new order in the database
  const result = await OrderModel.create({ ...payload, user: userData._id });
  return result;
};

// Get All Orders from Database
const getAllOrdersFromDb = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(OrderModel.find(), query)
    .search(["status", "orderType", "paymentStatus", "city", "state"])
    .filter();

  const orders = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  return { orders, meta };
};

// Get Order By ID
const getOrderByIdFromDb = async (id: string) => {
  const order = await OrderModel.findById(id).populate("user product");
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }
  return order;
};

// Update Order in Database
const updateOrderIntoDb = async (orderId: string, payload: Partial<TOrder>) => {
  const updatedOrder = await OrderModel.findOneAndUpdate(
    { _id: orderId },
    { ...payload },
    { new: true, runValidators: true },
  );

  if (!updatedOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  return updatedOrder;
};

// Delete Order in Database
const deleteOrderIntoDb = async (id: string) => {
  const deletedOrder = await OrderModel.findByIdAndDelete(id);

  if (!deletedOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  return deletedOrder;
};

export const OrderServices = {
  createOrderIntoDb,
  getAllOrdersFromDb,
  getOrderByIdFromDb,
  updateOrderIntoDb,
  deleteOrderIntoDb,
};
