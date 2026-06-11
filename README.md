# MOCKEA — Comprehensive IELTS Preparation Platform

Welcome to **MOCKEA**, a full-stack, monorepo web application designed to help users prepare for all modules of the IELTS exam (Reading, Listening, Writing, Speaking) through interactive mock environments, custom practice labs, automated grading, performance analytics, and a premium AI-powered tutor chatbot.

---

## 🚀 Project Overview

MOCKEA bridges the gap between simulated testing conditions and educational feedback. Built with the **MERN** stack, it provides:
- **Interactive Practice Labs** for modular practice.
- **Full-Length Mock Tests** simulating actual IELTS conditions.
- **Anti-Cheat Mechanics** enforcing test integrity (fullscreen locked, tab monitoring).
- **Instructor Review Flow** allowing trainers to lock submissions, assign band scores (0-9), and provide descriptive pedagogical feedback.
- **Google Analytics 4 (GA4)** client-side telemetry to monitor site performance, conversion rates, and exam violations.
- **AI Study Buddy & IELTS Tutor** providing voice-enabled interactive tutoring sessions powered by Gemini.

---

## 🛠️ Technology Stack

### Frontend
- **Framework & Tooling:** React 19, Vite, React Router 7
- **Styling & Theme:** Tailwind CSS 4, DaisyUI 5 (providing sleek components and theme selectors)
- **Animations:** Framer Motion, GSAP (GreenSock) for micro-animations and smooth page transitions
- **Audio Engines:** Howler.js (for Listening audio control)
- **State Management:** React Context API & TanStack Query (React Query 5) for clean, cached server-state retrieval
- **Forms & Validation:** React Hook Form, SweetAlert2, React Toastify
- **Services:** Firebase Auth (Client SDK) for user accounts, Google Analytics 4 (`react-ga4` standalone utility)

### Backend
- **Environment:** Node.js, Express 5
- **Database:** MongoDB & Mongoose (Object Document Mapper)
- **Authentication & Security:** Firebase Admin SDK, CORS, custom input sanitizers (XSS protection)
- **Media Hosting:** Cloudinary SDK (for questions' audio files)
- **AI Engine:** Gemini 2.5 Flash API (via `@google/genai` or similar integration)
- **Deployment:** Pre-configured with `vercel.json` for serverless API scaling on Vercel

---

## 📂 Project Architecture

MOCKEA is structured as a monorepo containing both the frontend client and the backend server:

```text
MOCKEA/
├── frontend/                      # React / Vite Client Application
│   ├── public/                    # Static Assets (Logos, SVGs, etc.)
│   ├── src/
│   │   ├── components/            # UI components
│   │   │   ├── Common/            # Reusable widgets (StatCard, TableShell, StudyBuddyChatbot, etc.)
│   │   │   └── Dashboard/         # Student & Admin dashboards, Settings Panels
│   │   ├── Layout/                # General and Dashboard layout templates
│   │   ├── Router/                # App route definitions & guards (PrivateRoutes)
│   │   ├── context/               # React contexts (e.g., Auth, Theme)
│   │   ├── hooks/                 # Custom shared hooks (useCountdown, useAnswers, useAdminQuery)
│   │   ├── utils/                 # Utility files (analytics helpers, alert configurations)
│   │   ├── index.css              # Global styles & Tailwind V4 directives
│   │   └── main.jsx               # Application entry point
│   ├── package.json
│   └── vite.config.js
│
└── backend/                       # Node.js / Express Server API
    ├── src/
    │   ├── controllers/           # API controllers containing core business logic
    │   ├── lib/                   # Integrations (database connections, AI services)
    │   ├── middlewares/           # Authentication guards, CORS, global error handler
    │   ├── model/                 # Mongoose schemas (User, Questions, MockTest, results, AI settings)
    │   ├── routes/                # Express API endpoint definitions
    │   ├── utils/                 # Utilities (input sanitizers, logs)
    │   └── index.js               # Entry script launching the server
    ├── package.json
    └── vercel.json                # Vercel Serverless routing deployment config
```

---

## ✨ Key Features & Integrations

### 1. Advanced Full Mock Test Simulator & Anti-Cheat Engine
- **Timed Exam Sequencing:** Guides the student sequentially through all four modules: Reading, Listening, Writing, Speaking.
- **Integrity Shields:** Enforces fullscreen mode. Employs `visibilitychange` and `fullscreenchange` event listeners to record violations.
- **Auto-Submission Trigger:** If the student exits fullscreen or changes tabs more than twice, the simulator triggers an automatic final submit.
- **State Crash Recovery:** Periodically updates `localStorage` (`test_cache_${testId}`) with current responses and remaining time. If the student suffers a crash or disconnects, the test restores instantly back to the exact second and question where they left off.

### 2. Premium AI Study Buddy & IELTS Tutor
- **Persona Toggling:** A floating, glassmorphic widget allowing students to choose between:
  - **IELTS Tutor:** Friendly, educational guidance, and hints.
  - **IELTS Examiner:** Strict evaluations using IELTS Band Score descriptors.
  - **Site Guide:** A conversational assistant helping navigate platform features.
- **Speech Synthesis & Recognition:** Utilizes Web Speech API for voice transcriptions (STT) and vocal readings of tutor responses (TTS).
- **Session Exporter:** Generates downloadable markdown files containing the dialogue exchange.
- **Security Sanitizer:** Integrates a strict `sanitizeInput.js` utility, filtering script injections (`<script>`), event triggers (`onerror=`), scripting URIs (`javascript:`), and syntax matching major programming codes to prevent prompt injections or execution escapes.
- **Daily Quotas:** Limits message frequencies according to subscription tiers (Free, Standard, Premium) or client IP addresses (Guests). Admin dashboards can toggle states, adjust default greetings, and modify query limits dynamically.

### 3. Google Analytics 4 (GA4) Standalone Tracking
- Stands independent of the Firebase SDK on the client side, using the standard `react-ga4` package.
- **Automated Pageview Tracking:** Logs SPA route navigation hooks in the client layout.
- **Exam Audits:** Fires telemetry for `test_start`, `test_submit`, and `test_auto_submitted_violation`.
- **Commerce Funnels:** Measures checkout actions (`begin_checkout`) on membership pricing pages.
- **Site Stability:** Logs client runtime errors to GA4 dashboard via the global exceptions handler (`errorLogger.js`).

### 4. Cloudinary Audio Lifecycles
- Listening exam segments host high-fidelity sound recordings on Cloudinary.
- Includes a backend hook to automatically remove assets from Cloudinary when an Admin deletes a question record from MongoDB, maintaining clean storage states.

---

## 📡 Core API Endpoints

The backend routes are prefix-scoped to `/api`. Key endpoints include:

| Route Endpoint | HTTP Method | Functionality |
| :--- | :--- | :--- |
| `/api/user/:email/role` | `GET` | Decides current dashboard and navigation layouts based on user roles |
| `/api/user/sync` | `POST` | Syncs current Firebase user metadata into local MongoDB |
| `/api/mock-tests` | `GET` | Fetches lists of available full-length mock exams |
| `/api/mock-tests/:id` | `GET` | Retrieves full mock test metadata and nested section questions |
| `/api/mock-tests/start` | `POST` | Sets up a `MockTestResult` session, starts timer, and locks the anti-cheat monitor |
| `/api/mock-tests/finalize` | `POST` | Auto-grades Listening & Reading, flags Writing & Speaking sections for instructor reviews |
| `/api/submissions` | `GET` | Retrieves ungraded writing/speaking submissions for instructors |
| `/api/submissions/:id/grade` | `POST` | Submits band scores (0-9) and qualitative comments |
| `/api/chatbot/query` | `POST` | Submits messages to the Gemini 2.5 Flash chatbot |
| `/api/chatbot/settings` | `GET` / `PUT` | Manages global controls, active states, custom greetings, and tier quotas |

---

## ⚙️ Environment Configuration

Set up local `.env` configuration files to wire up external services:

### Backend Configuration (`backend/.env`)
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_KEY=your_firebase_admin_sdk_json_string

# Cloudinary (Optional, for automatic listening audio cleanups)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini API (For AI Chatbot & IELTS Tutor)
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_local_url=http://localhost:3000/api/
VITE_live_url=https://your-production-backend.com/api/

# Firebase configuration
VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_firebase_auth_domain
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_firebase_storage_bucket
VITE_messagingSenderId=your_firebase_messaging_sender_id
VITE_appId=your_firebase_app_id

# Google Analytics 4 Measurement ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Atlas cluster or a running local instance)
- A [Firebase Project](https://console.firebase.google.com/) with Authentication active

### Step 1: Clone the repository
```bash
git clone https://github.com/armanislams/MOCKEA.git
cd MOCKEA
```

### Step 2: Set up the Backend
1. Open a terminal and navigate to the backend workspace:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create and populate your `.env` file based on the environment configurations section above.
4. Launch the API server in development mode:
   ```bash
   npm run dev
   ```
   The backend will start listening on `http://localhost:3000`.

### Step 3: Set up the Frontend
1. Open a new terminal window and navigate to the frontend workspace:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create and populate your local `.env` file based on the environment configurations section above.
4. Spin up the Vite dev server:
   ```bash
   npm run dev
   ```
   Open your browser to the local address displayed (usually `http://localhost:5173`).

---

## 🛡️ User Roles & Platform Navigation

### Student Journey
1. **Sign Up:** Register an account using Firebase authentication.
2. **Modular Practice:** Access **Practice Labs** to practice individual Reading, Listening, Writing, or Speaking sections. 
3. **Full Simulation:** Enter the **Mock Test Environment**, lock fullscreen, and complete a full 4-section timed test under anti-cheat supervision.
4. **Review Analytics:** Track scores, view correct/incorrect answers for auto-graded parts, examine band score progress trends, and view detailed tutor reviews.

### Instructor Review Center
1. **Role Access:** Log in using credentials with certified `instructor` roles.
2. **Locking Mechanism:** Lock specific student submissions to prevent multiple instructors from grading the same submission simultaneously.
3. **Review & Evaluate:** Listen to speaking recordings, read essay assignments, assign band scores, and leave text feedback.

### Admin Controls
1. **User Management:** Manage, query, ban/unban users, and update account permissions or pricing tiers.
2. **Content Management:** Create and edit practice sections using the unified components form builder. Combine multiple sections into full mock tests.
3. **Chatbot Config:** Adjust daily quotas, change welcome dialogues, and toggle chatbot state parameters globally.

---

*For issues, bug reports, or details on production builds, contact the development lead or email support@mockea.com.*
