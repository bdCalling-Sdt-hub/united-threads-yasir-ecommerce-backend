import { z } from "zod";

const createPaymentValidation = z.object({
  body: z.object({
    order: z.string({ required_error: "Order ID is required" }),
    amount: z
      .number({ required_error: "Amount is required" })
      .positive({ message: "Amount must be positive" }),
  }),
});

const createQuotePaymentValidation = z.object({
  body: z.object({
    amount: z
      .number({ required_error: "Amount is required" })
      .positive({ message: "Amount must be positive" }),
  }),
});

export const PaymentValidations = {
  createPaymentValidation,
  createQuotePaymentValidation,
};
