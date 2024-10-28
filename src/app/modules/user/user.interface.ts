import { Schema } from "mongoose";

export type TUser = {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  password: string;
  email: string;
  contact: string;
  validation: TValidation;
  role: TUserRole;
  isActive: boolean;
  isDelete: boolean;
  country?: string;
  state?: string;
  city?: string;
  houseNo?: string;
  area?: string;
  promptCount: number;
  isMessageBlock?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TValidation = {
  otp: number;
  expiry: string | null;
  isVerified: boolean;
};
export type TGender = "male" | "female";
export type TUserRole = "CUSTOMER" | "CSR" | "ADMIN";
