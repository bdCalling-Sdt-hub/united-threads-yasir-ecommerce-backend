import { z } from "zod";

const createCategoryValidationSchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(3, "Category name should be at least 3 characters long"),
  description: z.string().optional(),
  image: z.string({ required_error: "Category image is required" }),
});

export const CategoryValidations = {
  createCategoryValidationSchema,
};
