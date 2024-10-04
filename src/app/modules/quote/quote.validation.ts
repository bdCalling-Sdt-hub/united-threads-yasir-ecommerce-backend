import { z } from "zod";

const productSizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);

const quoteSchema = z
  .object({
    name: z.string().min(1, { message: "Product name is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    quantity: z.number().min(0, { message: "Quantity must be 0 or greater" }),
    price: z.number().positive({ message: "Price must be a positive number" }),
    size: productSizeEnum,
    frontSide: z.string().min(1, { message: "Front side description is required" }),
    backSide: z.string().min(1, { message: "Back side description is required" }),
    pantoneColor: z.string().min(1, { message: "Pantone color is required" }),
    hexColor: z.string().min(1, { message: "Hex color is required" }),
    //colorDuration: z.string().min(1, { message: "Color duration is required" }),
    materialPreferences: z.string().min(1, { message: "Material preference is required" }),
  })
  .strict();
const updateQuoteSchema = z
  .object({
    name: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    size: productSizeEnum.optional(),
    frontSide: z.any().optional(),
    backSide: z.any().optional(),
    pantoneColor: z.string().optional(),
    hexColor: z.string().optional(),
    colorDuration: z.string().optional(),
    materialPreferences: z.string().optional(),
  })
  .partial()
  .strict();

export const QuoteValidation = {
  quoteSchema,
  updateQuoteSchema,
};
