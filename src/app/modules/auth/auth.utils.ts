import jwt, { JwtPayload, Secret } from "jsonwebtoken";

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
  return jwt.verify(token, secret) as JwtPayload;
};
