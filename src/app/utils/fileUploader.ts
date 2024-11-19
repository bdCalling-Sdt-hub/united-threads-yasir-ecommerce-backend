import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "uploads");

    // Check if the uploads directory exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    // Add a timestamp to the file name for uniqueness
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});
const upload = multer({ storage: storage });

//const uploadToCloudinary = async (file: IFile): Promise<ICloudinaryResponse | undefined> => {
//  return new Promise((resolve, reject) => {
//    cloudinary.uploader.upload(file.path, (error: Error, result: ICloudinaryResponse) => {
//      fs.unlinkSync(file.path);
//      if (error) {
//        reject(error);
//      } else {
//        resolve(result);
//      }
//    });
//  });
//};

/**
 * Downloads an image from a given URL and stores it in the uploads folder.
 * @param {string} imageUrl - The URL of the image to download.
 * @param {string} filename - The name to save the file as.
 * @returns {Promise<string>} - The full path of the downloaded file.
 */
const downloadImageToLocal = async (imageUrl: string, filename: string): Promise<string> => {
  try {
    const uploadsFolder = path.join(path.join(process.cwd()), "uploads");

    // Create the uploads folder if it doesn't exist
    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder);
    }

    const filePath = path.join(uploadsFolder, filename);
    const response = await axios.get(imageUrl, { responseType: "stream" });

    // Write the image to disk
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Return a promise that resolves when the download completes
    return new Promise<string>((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to download image:", error);
    throw error;
  }
};

/**
 * Clears all files from the uploads folder.
 * @returns {void}
 */
const clearUploadsFolder = (): void => {
  try {
    const uploadsFolder = path.join(path.join(process.cwd()), "uploads");

    if (fs.existsSync(uploadsFolder)) {
      const files: string[] = fs.readdirSync(uploadsFolder);
      files.forEach((file: string) => {
        const filePath = path.join(uploadsFolder, file);
        fs.unlinkSync(filePath); // Remove the file
      });
      console.log("All files in the uploads folder have been removed.");
    } else {
      console.log("Uploads folder does not exist.");
    }
  } catch (error) {
    console.error("Failed to clear uploads folder:", error);
  }
};

export const fileUploader = {
  upload,
  downloadImageToLocal,
  clearUploadsFolder,
  //uploadToCloudinary,
};
