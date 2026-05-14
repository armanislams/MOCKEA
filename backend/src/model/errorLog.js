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
  },
  {
    timestamps: true,
  }
);

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);
export default ErrorLog;
