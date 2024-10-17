import { z } from "zod";
import { ORDER_STATUS_ENUM, ORDER_TYPE_ENUM, PAYMENT_STATUS_ENUM } from "./order.constant";

const orderStatusEnum = z.enum(ORDER_STATUS_ENUM as [string, ...string[]]);

const orderTypeEnum = z.enum(ORDER_TYPE_ENUM as [string, ...string[]]);

const paymentStatusEnum = z.enum(PAYMENT_STATUS_ENUM as [string, ...string[]]);

const orderSchema = z.object({
  body: z.object({
    product: z.string().min(1, { message: "Product ID is required" }),
    quantity: z.number().positive({ message: "Quantity must be greater than 0" }),
    amount: z.number().positive({ message: "Amount must be greater than 0" }),
    orderType: orderTypeEnum,
    duoAmount: z.number().positive({ message: "Duo must be a positive number" }).optional(),
    country: z.string().min(1, { message: "Country is required" }),
    state: z.string().min(1, { message: "State is required" }),
    city: z.string().min(1, { message: "City is required" }),
    color: z.string().min(1, { message: "Color is required" }),
    size: z.string().min(1, { message: "Size is required" }),
    houseNo: z.string().min(1, { message: "House number is required" }),
    area: z.string().min(1, { message: "Area is required" }),
  }),
});

const updateOrderSchema = z.object({
  body: z.object({
    status: orderStatusEnum.optional(),
    orderType: orderTypeEnum.optional(),
    paymentStatus: paymentStatusEnum.optional(),
    duoAmount: z.number().positive({ message: "Duo must be a positive number" }).optional(),
  }),
});

export const OrderValidation = {
  orderSchema,
  updateOrderSchema,
};
