
import dotenv from 'dotenv';
dotenv.config(); 
import mongoose from "mongoose";

const connectDB = async () => {
  console.log(process.env.DATABASE_URI)
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit process with failure code if connection fails
  }
};

export default connectDB;