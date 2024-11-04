import config from "../config";
import { USER_ROLE } from "../modules/user/user.constant";
import { TUser } from "../modules/user/user.interface";
import UserModel from "../modules/user/user.model";
import bcrypt from "bcrypt";

const admin = {
  firstName: "admin",
  lastName: "admin",
  isActive: true,
  isDelete: false,
  contact: "1234567890",
  profilePicture: "",
  validation: {
    otp: 0,
    expiry: null,
    isVerified: true,
  },
  password: "123456",
  email: "hello@theunitedthreads.com",
  role: USER_ROLE.ADMIN as TUser["role"],
};

const csr = {
  firstName: "csr",
  lastName: "csr",
  isActive: true,
  isDelete: false,
  contact: "1234567891",
  profilePicture: "",
  validation: {
    otp: 0,
    expiry: null,
    isVerified: true,
  },
  password: "123456",
  email: "csr@gmail.com",
  role: USER_ROLE.CSR as TUser["role"],
};

const seedAdminAndCSR = async () => {
  admin.password = bcrypt.hashSync(admin.password, Number(config.bcrypt_salt_rounds));

  // seed  admin
  const isAdminExists = await UserModel.findOne({ role: admin.role });
  if (!isAdminExists) {
    try {
      await UserModel.create(admin);
    } catch (error) {
      console.log(error);
    }
  }

  // seed csr
  const isCsrExists = await UserModel.findOne({ role: csr.role });
  if (!isCsrExists) {
    try {
      csr.password = bcrypt.hashSync(csr.password, Number(config.bcrypt_salt_rounds));
      await UserModel.create(csr);
    } catch (error) {
      console.log(error);
    }
  }
};

export default seedAdminAndCSR;
