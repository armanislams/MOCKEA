import mongoose from "mongoose";

const errorLogSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    method: {
      type: String,
    },
    path: {
      type: String,
    },
    status: {
      type: Number,
    },
    userEmail: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true }, // Keep updatedAt handled by mongoose, but createdAt will be our custom TTL field
  }
);

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);
export default ErrorLog;
