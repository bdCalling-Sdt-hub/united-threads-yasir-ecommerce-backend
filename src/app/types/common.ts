import { Request } from "express";
import { TUserRole } from "../modules/user/user.interface";
import { JwtPayload } from "jsonwebtoken";

export type TTokenUser = { email: string; role: TUserRole; _id: string } & JwtPayload;
export interface CustomRequest extends Request {
  user: TTokenUser;
}
