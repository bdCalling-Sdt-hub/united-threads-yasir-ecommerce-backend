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
    country: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    houseNo: z.string().min(1).optional(),
    area: z.string().min(1).optional(),
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
