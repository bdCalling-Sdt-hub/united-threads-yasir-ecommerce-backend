import { TTokenUser } from "../../types/common";
import { generateImage } from "./ai.utils";

const createImageIntoDb = async (
  user: TTokenUser,
  payload: {
    prompt: string;
    size?: "1024x1024" | "512x512" | "256x256";
  },
) => {
  const result = await generateImage(payload.prompt);

  //if (!result.length) {
  //  throw new AppError(httpStatus.BAD_REQUEST, "Failed to generate image");
  //}

  //LibraryModel.create({
  //  user: user._id,
  //  image: result[0],
  //});

  return result;
};

export const AiServices = {
  createImageIntoDb,
};
