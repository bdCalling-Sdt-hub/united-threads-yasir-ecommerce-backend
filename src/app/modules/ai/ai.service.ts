import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TTokenUser } from "../../types/common";
import UserModel from "../user/user.model";
import { generateImage } from "./ai.utils";

const createImageIntoDb = async (
  user: TTokenUser,
  payload: {
    prompt: string;
    size?: "1024x1024" | "512x512" | "256x256";
  },
) => {
  const userData = await UserModel.findOne({ email: user.email });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const userPromptCount = userData.promptCount;
  if (userPromptCount >= 10) {
    throw new AppError(httpStatus.BAD_REQUEST, "Prompt limit reached");
  }

  const result = await generateImage(payload.prompt);

  //if (!result.length) {
  //  throw new AppError(httpStatus.BAD_REQUEST, "Failed to generate image");
  //}

  //LibraryModel.create({
  //  user: user._id,
  //  image: result[0],
  //});

  await UserModel.updateOne({ _id: userData._id }, { $inc: { promptCount: 1 } });

  return result;
};

const removePromptCountEveryday = async () => {
  const result = await UserModel.updateMany({}, { $set: { promptCount: 0 } }, { multi: true });
  return result;
};

export const AiServices = {
  createImageIntoDb,
  removePromptCountEveryday,
};
