import mongoose from "mongoose";

const chatbotSettingsSchema = new mongoose.Schema(
  {
    isActive: { 
      type: Boolean, 
      default: true 
    },
    welcomeMessage: { 
      type: String, 
      default: "Hello! I'm your MOCKEA IELTS Tutor & Support Assistant. How can I help you today?" 
    },
    guestLimit: { 
      type: Number, 
      default: 5 
    },
    freeLimit: { 
      type: Number, 
      default: 20 
    },
    standardLimit: { 
      type: Number, 
      default: 100 
    },
    premiumLimit: { 
      type: Number, 
      default: 999999 
    }
  },
  { 
    timestamps: true 
  }
);

const ChatbotSettings = mongoose.model("ChatbotSettings", chatbotSettingsSchema);
export default ChatbotSettings;
