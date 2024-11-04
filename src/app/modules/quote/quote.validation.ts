import { z } from "zod";

const productSizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);

const quoteSchema = z
  .object({
    name: z.string().min(1, { message: "Product name is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    quantity: z.number().min(0, { message: "Quantity must be 0 or greater" }),
    price: z.number().positive({ message: "Price must be a positive number" }).optional(),
    size: productSizeEnum,
    frontSide: z.string().min(1, { message: "Front side description is required" }),
    backSide: z.string().min(1, { message: "Back side description is required" }),
    pantoneColor: z.string().min(1, { message: "Pantone color is required" }),
    hexColor: z.string().min(1, { message: "Hex color is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    state: z.string().min(1, { message: "State is required" }),
    city: z.string({ message: "City is required" }),
    houseNo: z.string().min(1, { message: "House number is required" }),
    area: z.string().min(1, { message: "Area is required" }),
    //colorDuration: z.string().min(1, { message: "Color duration is required" }),
    comment: z.string().optional(),
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
    quoteStatus: z.string().optional(),
    hexColor: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    houseNo: z.string().optional(),
    area: z.string().optional(),
    comment: z.string().optional(),
    //colorDuration: z.string().optional(),
    materialPreferences: z.string().optional(),
  })
  .strict();

export const QuoteValidation = {
  quoteSchema,
  updateQuoteSchema,
};
