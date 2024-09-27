/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import { PaymentModel } from "../payment/payment.model";
import UserModel from "../user/user.model";
import { TOrder } from "./order.interface";
import OrderModel from "./order.model";
import { PAYMENT_STATUS } from "./order.constant";

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

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Create a new order in the database
    const result = await OrderModel.create([{ ...payload, user: userData._id }], {
      session,
    });

    await PaymentModel.create(
      [
        {
          order: result[0]._id,
          amount: result[0].amount,
        },
      ],
      {
        session,
      },
    );

    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
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

const deleteUnpaidOrder = async () => {
  const session = await mongoose.startSession();
  try {
    // FIND ORDERS CREATED MORE THAN 30 MINUTES AGO AND STILL UNPAID
    const orders = await OrderModel.find({
      paymentStatus: PAYMENT_STATUS.UNPAID,
      createdAt: {
        $lt: new Date(Date.now() - 30 * 60 * 1000), // Orders created more than 30 minutes ago
      },
    });

    if (orders.length > 0) {
      session.startTransaction(); // Start transaction

      const orderIds = orders.map((order) => order._id);

      // Delete unpaid orders
      await OrderModel.deleteMany({ _id: { $in: orderIds } }).session(session);

      // Delete corresponding payments
      await PaymentModel.deleteMany({ order: { $in: orderIds } }).session(session);

      await session.commitTransaction(); // Commit the transaction
      await session.endSession(); // End the session
      console.log("Deleted unpaid orders");
    } else {
      console.log("No unpaid orders older than 30 minutes found");
    }
  } catch (error) {
    await session.abortTransaction(); // Abort transaction in case of error
    await session.endSession(); // End the session
    console.log("Error occurred:", error);
  }
};

export const OrderServices = {
  createOrderIntoDb,
  getAllOrdersFromDb,
  getOrderByIdFromDb,
  updateOrderIntoDb,
  deleteOrderIntoDb,
  deleteUnpaidOrder,
};
