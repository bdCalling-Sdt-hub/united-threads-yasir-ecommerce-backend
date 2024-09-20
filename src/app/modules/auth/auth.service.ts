import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";

import fs from "fs";
import jwt, { Secret } from "jsonwebtoken";
import moment from "moment";
import path from "path";
import { TTokenUser } from "../../types/common";
import { sendMail } from "../../utils/sendMail";
import UserModel from "../user/user.model";
import { createToken, verifyToken } from "./auth.utils";
import { TUser, TUserRole } from "../user/user.interface";

const signUpIntoDb = async (payload: TUser) => {
  const salt = Number(config.bcrypt_salt_rounds);
  const hashedPassword = await bcrypt.hash(payload.password, salt);

  const userData = await UserModel.create({
    ...payload,
    validation: { isVerified: false, otp: 0, expiry: null },
    password: hashedPassword,
  });

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Sign Up Failed");
  }

  const jwtPayload = { email: userData.email, role: userData.role, _id: userData._id.toString() };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as Secret,
    config.access_token_expire_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as Secret,
    config.refresh_token_expire_in as string,
  );

  //  SEND EMAIL FOR VERIFICATION
  const otp = Math.floor(100000 + Math.random() * 900000);
  const currentTime = new Date();
  // generate token
  const expiresAt = moment(currentTime).add(5, "minute");

  await UserModel.findByIdAndUpdate(userData._id, {
    validation: { isVerified: false, otp, expiry: expiresAt.toString() },
  });

  const parentMailTemplate = path.join(process.cwd(), "/src/template/verify.html");
  const forgetOtpEmail = fs.readFileSync(parentMailTemplate, "utf-8");
  const html = forgetOtpEmail
    .replace(/{{name}}/g, userData.firstName + " " + userData.lastName)
    .replace(/{{otp}}/g, otp.toString());
  sendMail({ to: userData.email, html, subject: "Forget Password Otp From United Threads" });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: userData._id,
      email: userData.email,
      role: userData.role,
      profilePicture: userData.profilePicture,
      firstName: userData.firstName,
      lastName: userData.lastName,
      validation: userData.validation,
    },
  };
};

const verifyAccount = async (token: string, payload: { email: string; otp: number }) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Please provide your token");
  }

  const decode = verifyToken(token, config.jwt_reset_secret as Secret);
  if (!decode) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Token");
  }

  const userData = await UserModel.findOne({ email: decode.email }).select("+validation.otp");

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid Email");
  }

  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }

  if (userData.validation?.isVerified === true) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is already verified");
  }

  if (userData.validation?.otp !== payload.otp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Otp");
  }

  await UserModel.findByIdAndUpdate(
    userData._id,
    { validation: { isVerified: true, otp: 0, expiry: null } },
    { new: true, runValidators: true },
  ).lean();

  const jwtPayload = { email: userData.email, role: userData.role, _id: userData._id.toString() };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.access_token_expire_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.refresh_token_expire_in as string,
  );

  return {
    accessToken,
    refreshToken,
    role: userData.role,
    _id: userData._id,
  };
};

const resendOtp = async (payload: { email: string }) => {
  const userData = await UserModel.findOne({ email: payload.email });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid Email");
  }

  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }

  //  SEND EMAIL FOR VERIFICATION
  const otp = Math.floor(100000 + Math.random() * 900000);
  const currentTime = new Date();
  // generate token
  const expiresAt = moment(currentTime).add(3, "minute");

  await UserModel.findOneAndUpdate(
    { email: userData.email },
    { validation: { isVerified: false, otp, expiry: expiresAt.toString() } },
  );
  const parentMailTemplate = path.join(process.cwd(), "/src/template/email.html");
  const forgetOtpEmail = fs.readFileSync(parentMailTemplate, "utf-8");
  const html = forgetOtpEmail
    .replace(/{{name}}/g, userData.firstName + " " + userData.lastName)
    .replace(/{{otp}}/g, otp.toString());
  sendMail({ to: userData.email, html, subject: "Forget Password Otp From Clinica" });

  // after send verification email put the otp into db
  await UserModel.findByIdAndUpdate(
    userData._id,
    { validation: { otp, expiry: expiresAt.toString(), isVerified: false } },
    { new: true, runValidators: true },
  );

  const jwtPayload = { email: userData.email, role: userData.role, _id: userData._id.toString() };
  const token = createToken(
    jwtPayload,
    config.jwt_reset_secret as string,
    config.jwt_reset_token_expire_in as string,
  );
  return {
    token,
    email: userData.email,
    _id: userData._id,
  };
};

const signInIntoDb = async (payload: { email: string; password: string; fcmToken: string }) => {
  const userData = await UserModel.findOne({ email: payload.email }).select("+password").lean();

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid Email");
  }

  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }

  const isMatch = await bcrypt.compare(payload.password, userData.password);
  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Password");
  }

  if (userData.validation?.isVerified === false) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is not verified");
  }

  const jwtPayload = { email: userData.email, role: userData.role, _id: userData._id.toString() };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.access_token_expire_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.refresh_token_expire_in as string,
  );
  return {
    accessToken,
    refreshToken,
    role: userData.role,
    _id: userData._id,
  };
};

const refreshToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, config.jwt_refresh_secret as string) as {
    email: string;
    role: TUserRole;
  };

  const userData = await UserModel.findOne({ email: payload.email }).select("+password").lean();
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }
  if (!userData.validation?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account is not verified");
  }

  const jwtPayload = { email: payload.email, role: payload.role, _id: userData._id.toString() };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.access_token_expire_in as string,
  );
  return {
    accessToken,
    role: userData.role,
    _id: userData._id,
  };
};

const changePassword = async (
  user: TTokenUser,
  payload: { email: string; oldPassword: string; newPassword: string },
) => {
  const userData = await UserModel.findOne({ email: user.email }).select("+password").lean();
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }
  if (!userData.validation?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account is not verified");
  }

  const isMatch = await bcrypt.compare(payload.oldPassword, userData.password);
  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Old Password");
  }

  const newPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));
  await UserModel.findOneAndUpdate({ email: userData.email }, { password: newPassword });
  return null;
};

const forgetPasswordIntoDb = async (email: string) => {
  const userData = await UserModel.findOne({ email: email });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid Email");
  }
  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }
  if (!userData.validation?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account is not verified");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  const currentTime = new Date();
  const jwtPayload = { email: userData.email, role: userData.role, _id: userData._id.toString() };
  // generate token
  const expiresAt = moment(currentTime).add(3, "minute");
  const token = createToken(jwtPayload, config.jwt_reset_secret as Secret, "3m");

  //  find user and update validation
  await UserModel.findOneAndUpdate(
    { email },
    { validation: { isVerified: false, otp, expiry: expiresAt.toString() } },
  );
  const parentMailTemplate = path.join(process.cwd(), "/src/template/email.html");
  const forgetOtpEmail = fs.readFileSync(parentMailTemplate, "utf-8");
  const html = forgetOtpEmail
    .replace(/{{name}}/g, userData.firstName + " " + userData.lastName)
    .replace(/{{otp}}/g, otp.toString());
  sendMail({ to: userData.email, html, subject: "Forget Password Otp From United Threads" });
  return {
    token,
  };
};

const resetPassword = async (token: string, payload: { password: string }) => {
  const decode = jwt.verify(token, config.jwt_reset_secret as Secret) as TTokenUser;
  const userData = await UserModel.findOne({ email: decode.email });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid Email");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Deleted");
  }
  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (!userData.validation?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account is not verified");
  }

  const newPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));
  await UserModel.findOneAndUpdate(
    { email: decode.email },
    { password: newPassword, validation: { isVerified: true, otp: 0, expiry: null } },
  );

  const jwtPayload = { email: userData.email, role: userData.role, _id: userData._id.toString() };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.access_token_expire_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.refresh_token_expire_in as string,
  );

  return {
    accessToken,
    refreshToken,
    role: userData.role,
    _id: userData._id,
  };
};

export const AuthServices = {
  signUpIntoDb,
  signInIntoDb,
  refreshToken,
  forgetPasswordIntoDb,
  resetPassword,
  verifyAccount,
  resendOtp,
  changePassword,
};
