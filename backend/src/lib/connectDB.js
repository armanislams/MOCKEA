import mongoose from "mongoose";
import "dotenv/config"

export const connectDb = async () => {
    const MongoDBUrl = process.env.MONGODB_URI;

    if(!MongoDBUrl){
        throw new Error("Please provide MongoDB URL");
    }

  try {
    await mongoose.connect(MongoDBUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
