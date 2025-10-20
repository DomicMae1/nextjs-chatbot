import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("⚠️ MONGODB_URI belum diatur di .env.local");

const DB_NAME = "chatbot";

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection.asPromise();
  }

  return mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME, // ✅ arahkan ke database chatbot
  });
};
