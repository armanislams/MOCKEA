import mongoose from "mongoose";

const blacklistedIpSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    reason: {
      type: String,
      default: "Unspecified security reason"
    },
    blockedBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const BlacklistedIp = mongoose.model("BlacklistedIp", blacklistedIpSchema);
export default BlacklistedIp;
