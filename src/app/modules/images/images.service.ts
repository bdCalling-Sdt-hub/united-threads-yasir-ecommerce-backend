import { TImage } from "./images.interface";

const uploadImagesIntoDb = async (productId: string, payload: TImage) => {
  console.log(productId);
  console.log(payload);
};

export const ImageServices = {
  uploadImagesIntoDb,
};
