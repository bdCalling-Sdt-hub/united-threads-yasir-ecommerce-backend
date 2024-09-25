import { z } from "zod";

const reviewSchema = z.object({
  body: z.object({
    product: z.string().min(1, { message: "Product ID is required" }),
    rating: z
      .number()
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating cannot be more than 5" }),
    comment: z.string().min(1, { message: "Comment is required" }),
  }),
});
const updateReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating cannot be more than 5" })
      .optional(),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  reviewSchema,
  updateReviewSchema,
};
