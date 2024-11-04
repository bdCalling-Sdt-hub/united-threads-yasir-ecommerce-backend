import { z } from "zod";

const imageSchema = z.object({
  product: z.string(),
  url: z.string().url({ message: "Must be a valid URL" }),
});

export const ImageValidations = {
  imageSchema,
};
