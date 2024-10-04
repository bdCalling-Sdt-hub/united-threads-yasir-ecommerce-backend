import { z } from "zod";

const createQuoteProductValidation = z.object({
  name: z.string({ required_error: "Product name is required" }),
  size: z
    .array(z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]), {
      required_error: "Size is required",
    })
    .nonempty({ message: "At least one size is required" }),
  frontSide: z.string({ required_error: "Front side image is required" }),
  backSide: z.string({ required_error: "Back side image is required" }),
  images: z.array(z.string()).max(4).optional(),
  category: z.string({ required_error: "Category ID is required" }),
  hexColor: z.string({ required_error: "Hex color is required" }),
  pantoneColor: z.string({ required_error: "Pantone color is required" }),
  colorsPreferences: z
    .array(z.string({ required_error: "Color preference is required" }))
    .nonempty({ message: "At least one color preference is required" }),
  isDeleted: z.boolean().optional(),
});

export default createQuoteProductValidation;

export const QuoteProductValidations = {
  createQuoteProductValidation,
};
