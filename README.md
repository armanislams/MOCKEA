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
- **Framework & Tooling:** React 19, Vite, React Router 7 (configured with **Route-Level Code-Splitting** / Lazy Loading)
- **Styling & Theme:** Tailwind CSS 4, DaisyUI 5 (providing sleek components and theme selectors)
- **Animations:** Framer Motion, GSAP (GreenSock) for micro-animations and smooth page transitions
- **Audio Engines:** Howler.js (for Listening audio control)
- **State Management:** React Context API & TanStack Query (React Query 5) for clean, cached server-state retrieval
- **Forms & Validation:** React Hook Form, SweetAlert2, React Toastify
- **Services:** Firebase Auth (Client SDK) with **Axios JWT Auto-Refresh Interceptors** for seamless session management

### Backend
- **Environment:** Node.js, Express 5, **PM2 Process Manager** (multi-core clustering)
- **Database:** MongoDB & Mongoose (Object Document Mapper) with optimized collection indexing
- **Caching Layer:** Redis Client with automatic **fail-safe local in-memory Map caching** fallback
- **Authentication & Security:** Firebase Admin SDK, CORS, custom input sanitizers, and JWT ownership verification gates
- **Media Hosting:** Cloudinary SDK with **secure direct-to-cloud signed uploads**
- **AI Engine:** Gemini 2.5 Flash API (via `@google/genai` or similar integration)

---

## 📂 Project Architecture

MOCKEA is structured as a monorepo containing both the frontend client and the backend server:

```text
MOCKEA/
├── README.md                      # Platform documentation
├── frontend/                      # React / Vite Client Application
│   ├── public/                    # Static Assets (Logos, SVGs, etc.)
│   ├── src/
│   │   ├── components/            # UI components
│   │   │   ├── Common/            # Reusable widgets (StatCard, TableShell, TestShell, etc.)
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
    ├── ecosystem.config.cjs       # PM2 clustering configuration
    ├── src/
    │   ├── controllers/           # API controllers containing core business logic
    │   ├── lib/                   # Integrations (database connections, AI services)
    │   ├── middlewares/           # Authentication guards, CORS, rate limiters
    │   ├── model/                 # Mongoose schemas (User, Questions, MockTest, results, AI settings)
    │   ├── routes/                # Express API endpoint definitions
    │   ├── utils/                 # Utilities (input sanitizers, cache, logs)
    │   └── index.js               # Entry script launching the server
    ├── package.json
    └── vercel.json                # Vercel Serverless routing deployment config
```

---

## ⚡ Performance, Scalability & Security Optimizations

To handle high traffic volume, large media payloads, and protect premium assets, MOCKEA features several production-grade optimization systems:

### 1. Process Clustering (PM2)
To leverage multi-core processors, the backend incorporates [ecosystem.config.cjs](file:///g:/project/MOCKEA/backend/ecosystem.config.cjs) running workers in cluster mode. Spawns one instance per logical CPU core, distributing connections via round-robin.

### 2. Dual-Engine Caching (Redis + Memory Fallback)
Avoids expensive database joins during populated Mock Test retrievals and Question set reads:
- Caches queries under `mocktest:${id}` and `question:${id}` in Redis.
- If Redis is unconfigured or goes offline, the [cache.js](file:///g:/project/MOCKEA/backend/src/utils/cache.js) utility automatically falls back to a local in-memory Map, ensuring high availability.
- Cache entries are cleared automatically on document updates and deletions.

### 3. Secure Direct-to-Cloud Signed Uploads
To prevent backend memory exhaustion and keep Cloudinary credentials hidden:
- The backend generates temporary cryptographically signed tokens via `GET /api/submissions/upload-signature`.
- The frontend uploads raw speaking test audio recordings directly to Cloudinary using the signature, bypassing Node.js buffer limits.

### 4. Database Optimization & Pagination
- Added schema indexes (`userEmail: 1` on `PracticeSubmissionSchema`) to resolve queries in $O(\log N)$ instead of collection scans.
- Implemented optional query pagination (`page`, `limit`) on user, submission, and result lists, setting total matches in the standard `X-Total-Count` header.

### 5. Plan-Tier Gates & Warnings
- **Free Plan:** Writing and speaking practice sections are hidden from the dashboard. Attempts to manually load these routes are caught by frontend guards and render a 403 Forbidden Upgrade card. Listening and reading queries are limited to 2 random questions. Mock test library displays upgrade warnings.
- **Standard Plan:** Standard users are capped at 1 Mock Test attempt per day (checked on the backend during test start) and see warning banners advising them to choose tests wisely.
- **Staff Restrictions:** Admins and instructors are blocked from taking mock tests (403 Forbidden).

---

## 📡 Core API Endpoints

The backend routes are prefix-scoped to `/api`. Key endpoints include:

| Route Endpoint | HTTP Method | Functionality |
| :--- | :--- | :--- |
| `/api/user/:email/role` | `GET` | Decides current dashboard and navigation layouts based on user roles |
| `/api/user/sync` | `POST` | Syncs current Firebase user metadata into local MongoDB |
| `/api/mock-tests` | `GET` | Fetches lists of available full-length mock exams |
| `/api/mock-tests/:id` | `GET` | Retrieves full mock test metadata and nested section questions (Cached) |
| `/api/mock-tests/start` | `POST` | Sets up a `MockTestResult` session, verifies daily limits, and locks anti-cheat monitor |
| `/api/mock-tests/finalize` | `POST` | Auto-grades Listening & Reading, flags Writing & Speaking sections for instructor reviews |
| `/api/submissions` | `GET` | Retrieves ungraded writing/speaking submissions for instructors (Paginated) |
| `/api/submissions/upload-signature` | `GET` | Generates secure Cloudinary signed upload credentials |
| `/api/submissions/:id/grade` | `POST` | Submits band scores (0-9) and qualitative comments |
| `/api/chatbot/query` | `POST` | Submits messages to the Gemini 2.5 Flash chatbot |

---

## ⚙️ Environment Configuration

Set up local `.env` configuration files to wire up external services:

### Backend Configuration (`backend/.env`)
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_KEY=your_firebase_admin_sdk_json_string

# Caching Configuration
REDIS_URL=redis://127.0.0.1:6379   # Optional, falls back to memory if empty

# Cloudinary (Direct-to-Cloud uploads and deletion cleanups)
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
- [PM2](https://pm2.keymetrics.io/) installed globally (for process clustering: `npm install pm2 -g`)

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
4. Launch the API server in clustered mode or dev mode:
   - **Clustered Mode (Production):** `pm2 start ecosystem.config.cjs`
   - **Development Mode:** `npm run dev`

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
2. **Modular Practice:** Access **Practice Labs** to practice individual Reading or Listening sections (Free users) or Writing and Speaking sections (Standard/Premium users).
3. **Full Simulation:** Enter the **Mock Test Environment** (Standard/Premium users), lock fullscreen, and complete a full 4-section timed test. Standard users are limited to 1 mock test per day.
4. **Review Analytics:** Track scores, view correct/incorrect answers for auto-graded parts, examine band score progress trends, and view detailed tutor reviews.

---

*For issues, bug reports, or details on production builds, contact the development lead or email support@mockea.com.*
