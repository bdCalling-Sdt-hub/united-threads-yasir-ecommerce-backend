/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import { TUser } from "./user.interface";
import UserModel from "./user.model";
import path from "path";
import fs from "fs";
import { sendMail } from "../../utils/sendMail";
import config from "../../config";

const getAllUsersFromDb = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(UserModel.find({ isDelete: false }), query)
    .search(["firstName", "lastName", "email", "role"])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await userQuery.countTotal();
  const users = await userQuery.modelQuery;
  return { meta, users };
};

const getSingleUserFromDb = async (userId: string) => {
  const result = await UserModel.findOne({ _id: userId, isDelete: false });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  return result;
};

const updateUser = async (userId: string, payload: Partial<TUser>) => {
  const result = await UserModel.findOneAndUpdate(
    { _id: userId },
    { ...payload },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteMyProfileFromDb = async (user: TTokenUser) => {
  const userData = await UserModel.findOne({ email: user.email }).select("+password").lean();
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (!userData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is Blocked");
  }
  if (userData.isDelete) {
    throw new AppError(httpStatus.BAD_REQUEST, "This Account already Deleted");
  }
  if (!userData.validation?.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your Account is not verified");
  }

  await UserModel.findOneAndUpdate({ _id: userData._id }, { isDelete: true });
  return null;
};

const getUserProfileFromDb = async (user: TTokenUser) => {
  const userData = await UserModel.findOne({ email: user.email }).lean();
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
  return userData;
};

const updateUserIntoDb = async (user: TTokenUser, payload: Partial<TUser>) => {
  const userData = await UserModel.findOne({ email: user.email });
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
  try {
    const result = await UserModel.findOneAndUpdate({ email: user.email }, payload, {
      new: true,
      runValidators: true,
    });
    return result;
  } catch (error: any) {
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const deleteUserFromDb = async (userId: string) => {
  const userData = await UserModel.findOne({ _id: userId });
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  await UserModel.findByIdAndUpdate({ _id: userId }, { isDelete: true });
  return null;
};

const sendMailIntoAdmin = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  description: string;
}) => {
  const parentMailTemplate = path.join(process.cwd(), "/src/template/customer_email.html");
  const sendEmail = fs.readFileSync(parentMailTemplate, "utf-8");
  const html = sendEmail
    .replace(/{{name}}/g, `${data.firstName} ${data.lastName}`)
    .replace(/{{description}}/g, data.description);
  await sendMail({
    to: "masumraihan3667@gmail.com" as string,
    from: data.email,
    html,
    subject: `${data.subject} | theunitedthreads.com`,
  });
};

const getCsrIdFromDb = async () => {
  const result = await UserModel.findOne({ role: "CSR" }).select("_id");

  return result;
};

export const UserServices = {
  getAllUsersFromDb,
  getSingleUserFromDb,
  updateUser,
  deleteMyProfileFromDb,
  getUserProfileFromDb,
  updateUserIntoDb,
  deleteUserFromDb,
  sendMailIntoAdmin,
  getCsrIdFromDb,
};
