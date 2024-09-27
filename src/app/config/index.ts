import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  appLink: process.env.APP_LINK,
  port: process.env.PORT,
  ip: process.env.IP,
  socket_port: process.env.SOCKET_PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASSWORD,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_reset_secret: process.env.JWT_RESET_SECRET,
  jwt_reset_token_expire_in: process.env.JWT_RESET_TOKEN_EXPIRED_IN,
  access_token_expire_in: process.env.JWT_ACCESS_TOKEN_EXPIRED_IN,
  refresh_token_expire_in: process.env.JWT_REFRESH_TOKEN_EXPIRED_IN,
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  payment: {
    secretKey: process.env.PAYMENT_GATEWAY_SECRET_KEY,
    webHookKey: process.env.WEB_HOOK_SECRET_KEY,
    paymentSuccessUrl: process.env.PAYMENT_SUCCESS_URL,
    paymentCancelUrl: process.env.PAYMENT_CANCEL_URL,
    webHookUrl: process.env.WEB_HOOK_URL,
  },
};
