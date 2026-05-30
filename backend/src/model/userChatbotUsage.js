import mongoose from "mongoose";

const userChatbotUsageSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      index: true 
    },
    ipAddress: { 
      type: String, 
      index: true 
    }, // Used to limit guest messages by IP address
    messageCount: { 
      type: Number, 
      default: 0 
    },
    lastUsedDate: { 
      type: String, 
      required: true 
    }, // Format: YYYY-MM-DD
  },
  { 
    timestamps: true 
  }
);

const UserChatbotUsage = mongoose.model("UserChatbotUsage", userChatbotUsageSchema);
export default UserChatbotUsage;
