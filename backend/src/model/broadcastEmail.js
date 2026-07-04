import mongoose from "mongoose";

const broadcastEmailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    cohort: {
      type: String,
      required: true,
      enum: ["all", "free", "standard", "premium", "inactive"],
    },
    recipientCount: {
      type: Number,
      required: true,
      default: 0,
    },
    recipients: {
      type: [String],
      default: [],
    },
    sentBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

const BroadcastEmail = mongoose.model("BroadcastEmail", broadcastEmailSchema);
export default BroadcastEmail;
