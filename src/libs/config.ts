import mongoose from "mongoose";

export const MORGAN_FORMAT = ":method :url :response-time [:status] \n";
export const AUTH_TIME = 24; // JWT token amal qilish vaqti (soatda)

/** String ko'rinishidagi ID ni Mongoose ObjectId ga aylantirib beruvchi yordamchi **/
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};
