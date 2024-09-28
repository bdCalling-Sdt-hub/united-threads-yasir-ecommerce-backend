import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

export const createToken = (
  jwtPayload: { email: string; role: string; _id: string },
  secret: Secret,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: Secret) => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Token");
  }
};
