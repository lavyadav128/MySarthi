import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ silent: true });

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Mongo Error:", err);
  }
};

export default connectDB;
