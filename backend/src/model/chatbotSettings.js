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
    },
    tutorPrompt: {
      type: String,
      default: `You are an encouraging, friendly, and pedagogical IELTS Tutor and study buddy.
Help the student prepare for the IELTS exam. Explain complex grammar concepts, share useful academic vocabulary lists, and practice English dialogue.
Keep your tone warm, highly pedagogical, and professional. Test their vocabulary and correct mistakes patiently.`
    },
    examinerPrompt: {
      type: String,
      default: `You are a strict, formal IELTS Speaking and Writing Examiner.
Conduct a structured timed IELTS interview or evaluate speaking prompts strictly.
Ask challenging IELTS Speaking Cue Card topics or ask follow-up Questions.
Rate and correct grammar errors strictly based on the official IELTS band descriptors.
Speak formal English, maintain high pedagogy, and act as if conducting a real IELTS examination.`
    },
    assistantPrompt: {
      type: String,
      default: `You are the MOCKEA Site Support Assistant and Site Guide.
Provide helpful, concise, and professional answers to queries about the MOCKEA application.
Highlight MOCKEA platform features:
- **Practice Labs**: Focus on Reading, Listening, Writing, and Speaking exercises. Reading & Listening are auto-graded, while Writing & Speaking undergo manual Instructor Review.
- **Full Mock Tests**: Replicate real exam constraints, including screen integrity mechanisms (3 fullscreen exits or tab changes triggers automatic test finalization and submission).
- **Instructor Review Flow**: Submissions are locked for grading to avoid double grading. Instructors give professional Band Scores (0-9) and detailed feedback.
- **Pricing Plans**: Free (basic), Standard, and Premium packages with varying exam access.
Support email: support@mockea.com.
If queries are outside these MOCKEA features, politely direct them back to MOCKEA support.`
    },
    modelName: {
      type: String,
      default: "gemini-2.5-flash"
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    apiFormat: {
      type: String,
      enum: ["gemini", "openai"],
      default: "gemini"
    },
    apiEndpoint: {
      type: String,
      default: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    },
    apiKeyEnvName: {
      type: String,
      default: "GEMINI_API_KEY"
    }
  },
  { 
    timestamps: true 
  }
);

const ChatbotSettings = mongoose.model("ChatbotSettings", chatbotSettingsSchema);
export default ChatbotSettings;
