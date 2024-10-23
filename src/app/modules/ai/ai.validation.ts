import { z } from "zod";

const createImageValidation = z.object({
  body: z
    .object({
      prompt: z.string().min(1, { message: "Prompt is required" }),
    })
    .strict(),
});

export const AiValidation = {
  createImageValidation,
};
