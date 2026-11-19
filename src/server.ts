import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";

const MONGO_URL = process.env.MONGO_URL as string;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connection succeeded (GameStore)");
    const PORT = process.env.PORT ?? 3005;
    app.listen(PORT, function () {
      console.info(`Server running on: http://localhost:${PORT}`);
      console.log(`Server running on Port:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
