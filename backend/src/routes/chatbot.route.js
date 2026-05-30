import express from "express";
import { 
  getChatbotSettings, 
  updateChatbotSettings, 
  chatWithAI 
} from "../controllers/chatbot.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";

const chatbotRouter = express.Router();

// Retrieve chatbot welcome message and active status
chatbotRouter.get("/settings", getChatbotSettings);

// Update chatbot settings (Admin only)
chatbotRouter.put(
  "/settings", 
  verifyUserToken, 
  verifyUserRole(["admin"]), 
  updateChatbotSettings
);

// Interact with the AI Chatbot (Public & Authenticated users)
chatbotRouter.post("/chat", chatWithAI);

export default chatbotRouter;
