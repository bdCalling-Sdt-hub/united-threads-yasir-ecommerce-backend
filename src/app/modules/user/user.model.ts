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
    email: { type: String, required: true },
    contact: { type: String, required: true },
    profilePicture: { type: String, default: null },
    password: { type: String, required: true, select: 0 },
    role: { type: String, enum: [...Object.keys(USER_ROLE)], required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
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
