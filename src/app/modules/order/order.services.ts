/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";
import { io } from "../../../server";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import CategoryModel from "../category/category.model";
import { TNotification } from "../notification/notification.interface";
import { NotificationServices } from "../notification/notification.service";
import { PaymentModel } from "../payment/payment.model";
import QuoteCategoryModel from "../quote-category/quote-category.model";
import UserModel from "../user/user.model";
import { PAYMENT_STATUS } from "./order.constant";
import { TOrder } from "./order.interface";
import OrderModel from "./order.model";

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

const createOrderForQuote = async (user: TTokenUser, payload: TOrder) => {
  const userData = await UserModel.findById(user._id).lean();

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
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
  let createdAt: string | null = null;

  // Extract the createdAt date and remove it from the query object
  if (query.createdAt) {
    createdAt = query.createdAt as string;
    delete query.createdAt; // Remove createdAt from the main query
  }

  const orderQuery = new QueryBuilder(OrderModel.find(), query)
    .search(["status", "orderType", "paymentStatus", "city", "state"])
    .filter()
    .createdAtRangeFilter("createdAt", createdAt)
    .sort()
    .paginate()
    .fields();

  // Execute the query and get results
  const orders = await orderQuery.modelQuery.populate("user product quote");
  const meta = await orderQuery.countTotal();

  return { orders, meta };
};

// Get Order By ID
const getOrderByIdFromDb = async (id: string) => {
  const order = await OrderModel.findById(id).populate("user product quote").lean();
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }
  return order;
};

// Update Order in Database
const updateOrderIntoDb = async (orderId: string, payload: Partial<TOrder>) => {
  const updatedOrder: any = await OrderModel.findOneAndUpdate(
    { _id: orderId },
    { ...payload },
    { new: true, runValidators: true },
  ).populate("user");

  if (!updatedOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  // after payment success create a notification and emit event
  const notificationPayload: TNotification = {
    title: "Order Updated",
    message: `Your order has been ${updatedOrder.status}.`,
    receiver: updatedOrder?.user?._id,
    type: "ORDER",
  };

  //io.emit(`notification::${updatedOrder?.user?._id}`, {
  //  success: true,
  //  data: notificationPayload,
  //});

  await NotificationServices.createNotificationIntoDb(notificationPayload);

  const { meta } = await NotificationServices.getNotificationFromDb(updatedOrder.user?._id, {});

  io.emit(`notification::${updatedOrder?.user?._id}`, {
    success: true,
    meta,
    data: { ...notificationPayload, order: updatedOrder },
  });

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

const getMyOrdersFromDb = async (user: TTokenUser, query: Record<string, unknown>) => {
  let createdAt: string | null = null;

  // Extract the createdAt date and remove it from the query object
  if (query.createdAt) {
    createdAt = query.createdAt as string;
    delete query.createdAt; // Remove createdAt from the main query
  }

  const orderQuery = new QueryBuilder(
    OrderModel.find({
      user: user._id,
    }),
    query,
  )
    .search(["status", "orderType", "paymentStatus", "city", "state"])
    .filter()
    .createdAtRangeFilter("createdAt", createdAt)
    .sort()
    .paginate()
    .fields();

  const orders = await orderQuery.modelQuery.populate("user product quote").lean();
  const meta = await orderQuery.countTotal();

  const result = await Promise.all(
    orders.map(async (order: any) => {
      let orderWithCategory: Record<string, unknown> = {};

      if (order?.quote?.category as string) {
        const categoryData = await QuoteCategoryModel.findOne({
          _id: order.quote.category,
        }).lean();

        const quote = {
          ...order.quote,
          category: categoryData,
        };

        orderWithCategory = {
          ...order,
          quote,
        };
      } else if (order?.product?.category as string) {
        const categoryData = await CategoryModel.findOne({ _id: order.product.category }).lean();

        const product = {
          ...order.product,
          category: categoryData,
        };

        orderWithCategory = {
          ...order,
          product,
        };
      }

      return orderWithCategory;
    }),
  );

  return { orders: result, meta };
};

const getMySingleOrderFromDB = async (user: TTokenUser, orderId: string) => {
  const order = await OrderModel.findOne({
    user: user._id,
    _id: orderId,
  }).populate("user product quote");
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }
  return order;
};

const updatePaymentStatus = async (
  orderId: string,
  payload: {
    refundAmount: number;
  },
) => {
  const { refundAmount } = payload;

  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const newAmount = order.amount - refundAmount;
    const newStatus = newAmount >= 0 ? order.paymentStatus : PAYMENT_STATUS.REFUNDED;
    const updateOrder = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      {
        paymentStatus: newStatus,
        amount: newAmount,
      },
      {
        session,
        new: true,
      },
    );

    if (!updateOrder) {
      throw new AppError(httpStatus.NOT_FOUND, "Failed to update order status");
    }

    // update payment status
    if (newAmount <= 0) {
      await PaymentModel.findOneAndUpdate(
        { order: orderId },
        {
          paymentStatus: newStatus,
        },
        {
          session,
          new: true,
        },
      );
    }

    await session.commitTransaction();
    return updateOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const OrderServices = {
  createOrderIntoDb,
  getAllOrdersFromDb,
  getOrderByIdFromDb,
  updateOrderIntoDb,
  deleteOrderIntoDb,
  deleteUnpaidOrder,
  createOrderForQuote,
  getMyOrdersFromDb,
  getMySingleOrderFromDB,
  updatePaymentStatus,
};
