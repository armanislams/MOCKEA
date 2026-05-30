# Walkthrough - MOCKEA Premium AI Global Chatbot & IELTS Tutor

This walkthrough documents the completed changes, files created/modified, and safety verification results for the **MOCKEA Global AI Chatbot**.

---

## 🛠️ Summary of Changes

### 1. Database & Schemas
- **[NEW] [chatbotSettings.js](file:///g:/project/MOCKEA/backend/src/model/chatbotSettings.js)**: Holds global controls, active state (`isActive`), customized greetings (`welcomeMessage`), and daily query limits mapped to:
  - `guestLimit`
  - `freeLimit`
  - `standardLimit`
  - `premiumLimit`
- **[NEW] [userChatbotUsage.js](file:///g:/project/MOCKEA/backend/src/model/userChatbotUsage.js)**: Documents calendar daily message counts (`messageCount` on `lastUsedDate` as `YYYY-MM-DD`) referencing either an authenticated `userId` or guest's `ipAddress`.

### 2. Multi-Layer Security Shields
- **[NEW] [sanitizeInput.js](file:///g:/project/MOCKEA/backend/src/utils/sanitizeInput.js)**: Secure XSS and injection filter blocking:
  - Standard HTML & script nodes (`<script>`, event triggers like `onerror=`, `onload=`, etc.).
  - Scripting URIs (`javascript:`).
  - Code pushes with programming structures (`const x =`, `let y =`, `function name()`, `import...from`, `require(`, `def `, `class `).
  - Escapes remaining html markup to guarantee inert text rendering.

### 3. Backend Controllers & Routes
- **[NEW] [chatbot.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/chatbot.controller.js)**: 
  - Dynamic limits validation matching `free`, `standard`, `premium` plans.
  - Multi-tier daily quota checks using user tokens or guest remote IPs.
  - Generates context-based system instructions corresponding to toggled persona modes (`tutor`, `examiner`, `assistant`) including strict LLM-level prompt override shields.
- **[NEW] [chatbot.route.js](file:///g:/project/MOCKEA/backend/src/routes/chatbot.route.js)**: Registers standard GET, secure PUT (admin-only), and conversation POST routes.
- **[MODIFY] [aiService.js](file:///g:/project/MOCKEA/backend/src/lib/aiService.js)**: Extends parent AI Service with a dedicated `chat()` method to process conversational chat logs using **Gemini 2.5 Flash**.
- **[MODIFY] [index.js](file:///g:/project/MOCKEA/backend/src/index.js)**: Mounts and registers `/api/chatbot` routes globally.

### 4. Interactive Floating Frontend Widget
- **[NEW] [StudyBuddyChatbot.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/StudyBuddyChatbot.jsx)**: Floating glassmorphic widget:
  - **Persona Tabs**: Toggleable personalities (encouraging **IELTS Tutor**, strict **IELTS Examiner**, knowledgeable **Site Guide**).
  - **AI Vocal Pronunciation (Text-to-Speech)**: Integrated native browser Speech Synthesis.
  - **Speech-to-Text Transcription**: Native browser voice recognition with pulsing audio waves.
  - **Transcript Exporter**: Downloads full markdown logs of the study session.
- **[MODIFY] [HomeLayout.jsx](file:///g:/project/MOCKEA/frontend/src/Layout/HomeLayout.jsx)** & **[MODIFY] [DashboardLayout.jsx](file:///g:/project/MOCKEA/frontend/src/Layout/DashboardLayout.jsx)**: Renders the chatbot floating button globally.

### 5. Admin Settings Panel
- **[MODIFY] [AdminSettings.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Admin Dashboard/AdminSettings.jsx)**: Expanded with a dedicated glassmorphic settings card allowing admins to customize dynamic welcome greetings, active toggles, and limits for all subscription tiers.

---

## 🧪 Safety & Verification Results

### 1. Backend Syntax Dry Run
Successfully validated backend server syntax and import maps without warnings:
```bash
> node --check src/index.js
# Exit code 0 (No syntax errors)
```

### 2. Sanitization & Code Injection Shields
Executed custom dry-run validations on security filters:

| Input Scenario | Expected Output | Verification Status |
| :--- | :--- | :--- |
| `"Hello, how can I prepare for speaking?"` | **Safe** | ✅ Pass |
| `"<script>alert('hack')</script>"` | **Blocked** (HTML tag / Script injection detected) | ✅ Pass |
| `"const x = 5; function run() { console.log(x); }"` | **Blocked** (Programming language syntax detected) | ✅ Pass |
| `"onclick=doSomething()"` | **Blocked** (Event handler trigger detected) | ✅ Pass |
| `"javascript:alert(1)"` | **Blocked** (Script URI detected) | ✅ Pass |

---

## 💡 How to Test & Preview

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the React client**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Verify Admin Dashboard**:
   - Log in as an Administrator.
   - Navigate to **System Settings**.
   - Use the **AI Study Buddy & Chatbot Settings** card to toggle active state, update the greeting, or adjust the guest/free limits.
4. **Try Chatbot Features**:
   - Open any public home screen or logged-in dashboard.
   - Tap the bottom-right floating chatbot icon.
   - Toggle tutor, examiner, or site guide modes.
   - Speak via the microphone button (STT) or hear pedagogical guidance using the speaker icon (TTS).
   - Export your transcripts using the top header download button.
