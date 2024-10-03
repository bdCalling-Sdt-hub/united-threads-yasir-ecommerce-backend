import { z } from "zod";

const productSizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);
const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  images: z.array(z.string().min(1, { message: "Product image is required" })),
  description: z.string().min(1, { message: "Product description is required" }),
  shortDescription: z.string().optional(),
  category: z.string({ required_error: "Category is required" }),
  quantity: z.number().min(0, { message: "Quantity must be 0 or greater" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  size: z.array(productSizeEnum),
});

export const ProductValidations = {
  productSchema,
};
