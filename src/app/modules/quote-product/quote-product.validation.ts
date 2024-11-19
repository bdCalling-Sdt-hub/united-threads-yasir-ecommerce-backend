import { z } from "zod";

const productImageValidation = z.object({
  url: z.string(),
  key: z.string(),
});

const createQuoteProductValidation = z
  .object({
    name: z.string({ required_error: "Product name is required" }),
    size: z
      .array(z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]), {
        required_error: "Size is required",
      })
      .nonempty({ message: "At least one size is required" }),
    frontSide: z.string({ required_error: "Front side image is required" }),
    backSide: z.string({ required_error: "Back side image is required" }),
    images: z.array(productImageValidation).optional(),
    category: z.string({ required_error: "Category ID is required" }),
    colorsPreferences: z
      .array(z.string({ required_error: "Color preference is required" }))
      .optional(),
    isDeleted: z.boolean().optional(),
  })
  .strict();

const updateQuoteProductValidation = z
  .object({
    name: z.string().optional(),
    size: z
      .array(z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]), {
        required_error: "Size is required",
      })
      .nonempty({ message: "At least one size is required" })
      .optional(),
    frontSide: z.string().optional(),
    backSide: z.string().optional(),
    images: z.array(productImageValidation).optional(),
    category: z.string().optional(),
    colorsPreferences: z
      .array(z.string({ required_error: "Color preference is required" }))
      .nonempty({ message: "At least one color preference is required" })
      .optional(),
    isDeleted: z.boolean().optional(),
  })
  .strict();

export const QuoteProductValidations = {
  createQuoteProductValidation,
  updateQuoteProductValidation,
};
