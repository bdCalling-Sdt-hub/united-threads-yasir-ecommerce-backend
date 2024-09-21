import { z } from "zod";

const updateUserValidation = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email({
      message: "Invalid email address",
    }),
    contact: z.string(),
    profilePicture: z.string(),
  })
  .partial()
  .strict();

const updateUserByAdminValidation = z.object({
  body: z.object({
    isActive: z.boolean(),
    isDelete: z.boolean(),
  }),
});

export const UserValidations = {
  updateUserValidation,
  updateUserByAdminValidation,
};
