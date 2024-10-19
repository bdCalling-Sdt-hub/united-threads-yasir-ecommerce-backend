import httpStatus from "http-status";
import { CustomRequest, TTokenUser } from "../../types/common";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderServices } from "./order.services";

const createOrder = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await OrderServices.createOrderIntoDb(user as TTokenUser, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const { orders, meta } = await OrderServices.getAllOrdersFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    meta,
    data: orders,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const result = await OrderServices.getOrderByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

const updateOrder = catchAsync(async (req, res) => {
  const orderId = req.params.id;
  const result = await OrderServices.updateOrderIntoDb(orderId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order updated successfully",
    data: result,
  });
});

const deleteOrder = catchAsync(async (req, res) => {
  const orderId = req.params.id;
  const result = await OrderServices.deleteOrderIntoDb(orderId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const { meta, orders } = await OrderServices.getMyOrdersFromDb(user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    meta,
    data: orders,
  });
});

const getMySingleOrder = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await OrderServices.getMySingleOrderFromDB(user, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders,
  getMySingleOrder,
};
