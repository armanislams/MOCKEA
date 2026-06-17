import mongoose from "mongoose";
import "dotenv/config"

export const connectDb = async () => {
    const MongoDBUrl = process.env.MONGODB_URI;

    if(!MongoDBUrl){
        throw new Error("Please provide MongoDB URL");
    }

  try {
    await mongoose.connect(MongoDBUrl, {
      maxPoolSize: 20,
      minPoolSize: 5
    });
    console.log("Connected to MongoDB (pool: 5-20)");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
