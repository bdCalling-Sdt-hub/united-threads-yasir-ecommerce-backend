import httpStatus from "http-status";
import config from "../../config";
import { CustomRequest, TTokenUser } from "../../types/common";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import AppError from "../../errors/AppError";
import jwt from "jsonwebtoken";

const signUp = catchAsync(async (req, res) => {
  const { token } = await AuthServices.signUpIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sign Up successfully!, please verify your email",
    data: {
      token,
    },
  });
});

const verifyAccount = catchAsync(async (req, res) => {
  const { token } = req.headers;
  const { accessToken, refreshToken, role, _id } = await AuthServices.verifyAccount(
    token as string,
    req.body,
  );
  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account verified successfully",
    data: {
      accessToken,
      role,
      _id,
    },
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const t = req.headers.token as string;
  if (!t) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Please provide your token");
  }

  const decode = jwt.decode(t) as TTokenUser;
  if (!decode) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Token");
  }

  const { token } = await AuthServices.resendOtp(decode, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Otp resend successfully",
    data: {
      token: token,
    },
  });
});

const signIn = catchAsync(async (req, res) => {
  const result = await AuthServices.signInIntoDb(req.body);
  const { refreshToken, accessToken, role, _id } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sign In successfully!",
    data: {
      accessToken,
      refreshToken,
      role,
      _id,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken, role, _id } = req.cookies;
  const { accessToken } = await AuthServices.refreshToken(refreshToken);
  res.cookie("token", accessToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token successfully",
    data: {
      accessToken,
      role,
      _id,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = (req as CustomRequest).user;
  const result = await AuthServices.changePassword(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body?.email;
  const result = await AuthServices.forgetPasswordIntoDb(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Please check you email",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.token as string;
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Please provide your token");
  }
  const { accessToken, refreshToken, role, _id } = await AuthServices.resetPassword(
    token as string,
    req.body,
  );

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully!",
    data: {
      accessToken,
      role,
      _id,
    },
  });
});

export const AuthController = {
  signUp,
  signIn,
  refreshToken,
  forgetPassword,
  resetPassword,
  verifyAccount,
  resendOtp,
  changePassword,
};
