import { z } from "zod";

const createLibraryValidation = z.object({
  body: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    })
    .strict(),
});

export const LibraryValidations = {
  createLibraryValidation,
};
