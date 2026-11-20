import path from "path";
import multer from "multer";
import { v4 } from "uuid";

/** MULTER DISK STORAGE SOZLAMASI **/
function getTargetImageStorage(address: string) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${address}`);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext;
      const random_name = v4() + extension;
      cb(null, random_name);
    },
  });
}

/** Berilgan papka (products yoki members) uchun uploader yasovchi funksiya **/
const makeUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({ storage: storage });
};

export default makeUploader;
