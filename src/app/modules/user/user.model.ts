import { model, Schema } from "mongoose";
import { TUser, TValidation } from "./user.interface";
import { USER_ROLE } from "./user.constant";

const validationSchema = new Schema<TValidation>({
  otp: { type: Number, default: 0, select: 0 },
  expiry: { type: String, default: null, select: 0 },
  isVerified: { type: Boolean, default: false },
});

const UserSchema = new Schema<TUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    profilePicture: { type: String, default: null },
    password: { type: String, required: true, select: 0 },
    role: { type: String, enum: [...Object.keys(USER_ROLE)], required: true },
    country: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    area: { type: String, default: null },
    houseNo: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    promptCount: { type: Number, default: 0 },
    validation: { type: validationSchema },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isDelete: false } });
UserSchema.index({ contact: 1 }, { unique: true, partialFilterExpression: { isDelete: false } });

const UserModel = model<TUser>("User", UserSchema);
export default UserModel;
