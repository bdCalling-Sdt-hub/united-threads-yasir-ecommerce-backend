import { z } from "zod";

const productSizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);

const productImageValidation = z.object({
  url: z.string(),
  key: z.string(),
});

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  images: z.array(productImageValidation).optional(),
  primaryImage: z.string(),
  colorsPreferences: z.array(z.string()),
  description: z.string().min(1, { message: "Product description is required" }),
  shortDescription: z.string().optional(),
  category: z.string({ required_error: "Category is required" }),
  stock: z.number({ required_error: "Stock is required" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  size: z.array(productSizeEnum),
});

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  images: z.array(productImageValidation).optional(),
  primaryImage: z.string().optional(),
  colorsPreferences: z.array(z.string()).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  stock: z.number().optional(),
  price: z.number().positive({ message: "Price must be a positive number" }).optional(),
  size: z.array(productSizeEnum).optional(),
});

export const ProductValidations = {
  productSchema,
  productUpdateSchema,
};
