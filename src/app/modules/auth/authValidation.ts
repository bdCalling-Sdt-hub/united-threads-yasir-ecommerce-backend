import { z } from "zod";

const signUpValidationSchema = z.object({
  body: z
    .object({
      firstName: z.string({ required_error: "First Name is required" }),
      lastName: z.string().optional(),
      email: z.string({ required_error: "Email is required" }).email({
        message: "Invalid email address",
      }),
      contact: z.string({ required_error: "Contact is required" }),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
    })
    .strict(),
});

const signInValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" }),
    fcmToken: z.string().optional(),
  }),
});
const refreshTokenValidation = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required!",
    }),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    newPassword: z.string({ required_error: "New password is required" }),
  }),
});

const forgetPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
  }),
});

const optValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    otp: z.number({ required_error: "OTP is required" }),
  }),
});

const resendOtpValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
  }),
});

export const AuthValidations = {
  signUpValidationSchema,
  signInValidation,
  refreshTokenValidation,
  forgetPasswordValidation,
  optValidation,
  resendOtpValidation,
  changePasswordValidation,
};
