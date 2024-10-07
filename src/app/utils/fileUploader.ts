import multer from "multer";
import path from "path";
import fs from "fs";

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

export const fileUploader = {
  upload,
  //uploadToCloudinary,
};
