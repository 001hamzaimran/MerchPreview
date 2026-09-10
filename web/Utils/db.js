import "./polyfill.js";
import mongoose from "mongoose";

const connectDB = async () => {
  // mongodb://localhost:27017/merch-preview
  const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.scibxar.mongodb.net/merch-preview";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB connection warning: ${error.message}`);
  }
};

export default connectDB;