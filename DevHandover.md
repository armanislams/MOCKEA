# MOCKEA Developer Handover Documentation

This document provides a comprehensive technical overview of the MOCKEA platform for developers. It covers the full-stack architecture, database models, backend routing tables, security parameters, caching, direct-to-cloud uploads, client-side global error tracking, and cataloged reusable UI components/custom hooks.

---

## 1. System Overview

MOCKEA is a full-stack, scalable online test preparation platform built on the **MERN** stack:
- **Frontend**: Built using Vite + React 19 + Tailwind CSS 4 + DaisyUI 5. Uses **Route-Level Code-Splitting (lazy loading)** via React `lazy` and `Suspense` to optimize bundle delivery.
- **Backend**: Structured on Node.js + Express 5. Configured for high-concurrency horizontal scaling using **PM2 Process Clustering**.
- **Database**: MongoDB (Mongoose ODM). Leverages targeted database indexes for performance.
- **Authentication**: Synced through Firebase Authentication (client) and mapped in custom Express request contexts via Firebase Admin SDK validation. Uses an **Axios ID Token auto-refresh interceptor** to automatically inject fresh JWTs on every secure call, preventing session dropouts.
- **State Management**: Orchestrated via native React Context API (e.g., Auth state) and TanStack Query (React Query 5) for cache-aware server state management.
- **Analytics**: Client-side event tracking utilizing Google Analytics 4 (GA4) telemetry via `react-ga4`.

---

## 2. Database Schemas (`backend/src/model/`)

All database interactions use Mongoose ODM. Below is the full catalog of models:

### **Users (`user.js`)**
Tracks accounts synced from Firebase.
- **`role`**: Enum (`student`, `admin`, `instructor`). Defaults to `student`.
- **`plan`**: Enum (`free`, `standard`, `premium`). Defaults to `free`.
- **`targetExam`**: Enum (`IELTS`, `PTE`, `BOTH`).
- **`isBanned`**: Boolean flag indicating account suspension.

### **Questions (`questions.js`)**
Stores individual questions, passages, and modular configurations.
- **`testType`**: Enum (`reading`, `listening`, `writing`, `speaking`).
- **`passage`**: Reading passage body (supports raw HTML and markdown).
- **`audioUrl`**: Cloudinary URL for Listening clips.
- **`questions`**: Nested array of question objects containing options, prompts, and a `correctAnswer` key for auto-grading.

### **MockTest (`mockTest.js`)**
A container holding references to four questions (one for each section: Reading, Listening, Writing, Speaking) to form a full IELTS/PTE mock exam.
- References MongoDB IDs in the `Questions` collection.

### **PracticeSubmission (`practiceSubmission.js`)**
Stores individual skill practice laboratory submissions (Writing text or Speaking audio links).
- **`userEmail`**: Indexed for query optimization.
- **`status`**: Enum (`pending`, `reviewed`).
- **`feedback` / `score` / `bandScore`**: Pedagogical assessment fields.
- **`lockedBy` / `lockExpiresAt`**: Instructors' mutex locks to prevent overlapping reviews.

### **MockTestResult (`mockTestResult.js`)**
Tracks student progress inside a full Mock Test.
- **`tabSwitchCount` / `fullscreenExits`**: Client telemetry tracking exam violations.
- **`lockedBy` / `lockExpiresAt`**: Grading mutexes.

### **Resource (`Resource.js`)**
Stores free study resources (PDF downloads/templates) downloadable by students.
- **`category`**: Enum (`Vocabulary`, `Writing Guide`, `Speaking Templates`, `Study Tips`, `General`).
- **`link` / `imageUrl`**: Cloud URLs for file downloads and previews.
- **`downloadCount`**: tracks resource popularity.

### **ChatbotSettings (`chatbotSettings.js`)**
Global settings configuring the Study Buddy AI Chatbot.
- **`isActive`**: Toggle switch to enable/disable the AI chatbot globally.
- **`welcomeMessage`**: Default greeting string.
- **`guestLimit`, `freeLimit`, `standardLimit`, `premiumLimit`**: Message quotas per plan tier.

### **UserChatbotUsage (`userChatbotUsage.js`)**
Tracks chatbot usage quotas.
- **`userId`** (ref: `User`) or **`ipAddress`** (for Guests).
- **`messageCount`**: Number of messages sent during the current calendar date.
- **`lastUsedDate`**: Calendar date formatted as `YYYY-MM-DD` (used to reset usage limits daily).

### **Pricing (`pricing.js`)**
Configures subscription tier products, options, and pricing plans.
- **`priceId` / `name` / `price` / `duration` / `features` / `isPopular`**: Synchronized feature mapping data.

### **Trainer (`trainer.js`)**
Profiles for AI/human speaking and writing evaluators.
- **`specialty`**: Indexed field (e.g. "IELTS Speaking Tutor").
- **`rating` / `experience` / `bio` / `imageUrl`**: Profile telemetry.

### **ErrorLog (`errorLog.js`)**
Stores unhandled backend runtime exceptions and forwarded client-side errors.
- **`createdAt`**: Features a MongoDB TTL index that automatically expires and deletes records after 30 days (`expires: 30 * 24 * 60 * 60`) to keep the database footprint lightweight.

---

## 3. Performance & Scalability Core

Developers maintaining the codebase under high production traffic should leverage the following mechanisms:

### A. PM2 Clustering Configuration
Defined in [ecosystem.config.cjs](file:///g:/project/MOCKEA/backend/ecosystem.config.cjs) in the backend root:
- Runs in `cluster` mode using `'max'` CPU cores.
- Automatically distributes incoming TCP requests round-robin among backend workers.
- Command line monitoring: Run `pm2 list` or `pm2 monit` on the server.

### B. Dual-Engine Caching Client
Located in [cache.js](file:///g:/project/MOCKEA/backend/src/utils/cache.js):
- **Redis Engine:** Connects to `REDIS_URL` with standard string values caching and custom TTLs.
- **In-Memory Fallback:** If `REDIS_URL` is undefined or the Redis host goes offline, it automatically falls back to an in-memory JavaScript `Map` cache client. This fallback design keeps database performance optimized while preventing crashes.
- **Cache Eviction Points:**
  - Mock Tests: [mockTest.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/mockTest.controller.js) caches configurations under keys `mocktest:${id}`, and evicts them on updates or deletions.
  - Questions: [questions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/questions.controller.js) caches questions under keys `question:${id}`, and evicts them on changes.

### C. Server-Side Pagination
Centralized in database queries to avoid Node.js Out-Of-Memory errors on large data lists:
- Extracts `page` and `limit` query parameters.
- Employs `.skip((page - 1) * limit).limit(limit)` mongoose queries.
- Exposes total matches via the custom `X-Total-Count` header, which is explicitly allowed to bypass CORS via `Access-Control-Expose-Headers` configuration in [index.js](file:///g:/project/MOCKEA/backend/src/index.js).

### D. Input Sanitization & Anti-Injection Middleware
Defined in [sanitize.js](file:///g:/project/MOCKEA/backend/src/middlewares/sanitize.js) and loaded globally:
- **NoSQL Injection Guard:** Recursively scans incoming query, param, and body objects, stripping out any keys starting with `$` or containing `.`.
- **XSS Guard:** Strips out dangerous script elements, frames (`<iframe>`, `<object>`, `<embed>`, `<applet>`), inline event listeners (`onload`, `onclick`), and `javascript:` URIs.

### E. Rate Limiting Middleware
Configured using sliding-window tracking in [apiRateLimiter.js](file:///g:/project/MOCKEA/backend/src/middlewares/apiRateLimiter.js):
- **Global API Rate Limit:** 60 requests per minute per IP address.
- **Sensitive Routes:** Registered endpoints like registration `/api/user/auth/register` (capped at 10 requests/min) and test submissions `/api/submissions/submit` (capped at 5 requests/min) enforce strict limits.

---

## 4. Secure Direct-to-Cloud Uploads

To offload file buffer stream workloads from Node.js Express memory when students upload speaking responses, the platform uses **Signed Cloudinary Uploads**:

```text
[Frontend Client]
      │
      ├─ 1. Get Signature ──> [GET /api/submissions/upload-signature] (Backend)
      │                                    │
      │                             (Backend verifies JWT,
      │                             signs timestamp & folder)
      │                                    │
      ├─ 2. Return Signed Credentials <────┘
      │
      ├─ 3. Direct Signed Upload ─────────────────────────> [Cloudinary API]
      │                                                          │
      │                             (Uploads file directly,
      │                              bypassing backend server)
      │                                                          │
      ├─ 4. Returns secure_url <─────────────────────────────────┘
      │
      └─ 5. POST payload with secure_url ──> [POST /api/submissions/submit]
```

### Key Source Locations:
- **Backend Signature Generator:** `getUploadSignature` in [submissions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/submissions.controller.js) signs timestamps and target folder keys using `CLOUDINARY_API_SECRET`.
- **Frontend Uploader:** The helper `uploadToCloudinary` inside both [Speaking.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/Speaking/Speaking.jsx) and [SpeakingSection.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/FullMockTest/SpeakingSection.jsx) fetches the signature via `axiosSecure` before uploading the audio blob directly to Cloudinary.

---

## 5. Security Gates, Gating & Anti-Spoofing

### A. Ownership Gating Helper (`isOwnerOrAdmin`)
Defined at the top of [user.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/user.controller.js). It compares the current authenticated user's `req.decoded_email` against the requested email parameter. If they do not match and the user is not an `"admin"`, it returns a `403 Forbidden` response. Used in:
- `getUserProfile`
- `updateUserExamPreference`

### B. Anti-Spoofing Payload Overwrites
Inside `submitPractice` in [submissions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/submissions.controller.js), the backend forcefully overwrites `userEmail` and `userName` fields in the generated `PracticeSubmission` database instance using verified properties from the decoded JWT database object (`req.decoded_email` and `req.user.name`), preventing spoofing.

### C. Plan-Tier UI Gating & Guards
- **Free Plan Gating:** Hides Writing and Speaking tiles dynamically in [DashboardHome.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/DashboardHome.jsx) using the `useUserProfile()` profile plan status.
- **Route-level 403 Blockers:** If a free user manually navigates to `/dashboard/speaking` or `/dashboard/writing`, code inside [Speaking.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/Speaking/Speaking.jsx) and [Writing.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/Writing/Writing.jsx) renders a premium upgrade screen.
- **Daily Mock Limits:** Standard tier users are capped at 1 Mock Test attempt per day, checked on the backend `startTest` controller. Free tier users are blocked entirely from Mock Tests.
- **Staff Gating:** Admins and instructors are blocked from attempting tests in `startTest` (`403 Forbidden`).

---

## 6. API Route Mapping

All endpoints are registered under `/api` in [index.js](file:///g:/project/MOCKEA/backend/src/index.js).

| Route Prefix / Path | HTTP Method | Controllers File | Middleware/Guards | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`/api/user`** | | | | |
| `/verifyEmail/:email` | `GET` | `user.controller.js` | None | Verify if email exists in database |
| `/auth/register` | `POST` | `user.controller.js` | Rate Limit (10/min) | Sync Firebase registration |
| `/all` | `GET` | `user.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Returns user listing (Paginated) |
| `/:email/role` | `GET` | `user.controller.js` | `verifyUserToken` | Returns user role |
| `/:email` | `GET` | `user.controller.js` | `verifyUserToken` | Returns user profile (Ownership checked) |
| `/:id/exam-preference`| `PATCH` | `user.controller.js` | `verifyUserToken` | Update exam preferences (Ownership checked) |
| `/:id/role` | `PATCH` | `user.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Modify user role |
| `/:id/plan` | `PATCH` | `user.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Modify user billing tier |
| `/:id/ban` | `PATCH` | `user.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Ban / Unban user |
| `/:id` | `DELETE`| `user.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Delete user account |
| **`/api/questions`** | | | | |
| `/` | `GET` | `questions.controller.js` | `verifyUserToken` | Fetch question lists |
| `/:id` | `GET` | `questions.controller.js` | `verifyUserToken` | Get detailed question (Cached) |
| `/evaluate` | `POST` | `questions.controller.js` | `verifyUserToken` | Evaluates student answers |
| `/add` | `POST` | `questions.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Add question set |
| `/:id` | `PUT` | `questions.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Update question set |
| `/:id` | `DELETE`| `questions.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Delete question set |
| **`/api/mock-tests`**| | | | |
| `/` | `GET` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Get all mock tests |
| `/results/user` | `GET` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Get authenticated user's results |
| `/results/all` | `GET` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Get all results (Paginated) |
| `/results/:id` | `GET` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Get detailed result |
| `/:id` | `GET` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Get test by ID (Cached) |
| `/start` | `POST` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Initialize mock test attempt |
| `/submit-section` | `POST` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Submit single mock test section |
| `/update-cheat-stats`| `POST` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Record tab switches / cheat flags |
| `/finalize` | `POST` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole()` | Finalize full mock test |
| `/grade-section` | `PATCH` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Save manual grading scores |
| `/lock/:id` | `PATCH` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Lock result for grading |
| `/results/:id` | `DELETE`| `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Delete mock test result |
| `/create` | `POST` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Create mock test |
| `/:id` | `PUT` | `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Update mock test |
| `/:id` | `DELETE`| `mockTest.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Delete mock test |
| **`/api/public-mock-tests`** | | | | |
| `/` | `GET` | `publicMockTest.controller.js`| None | List public mock tests |
| `/:id` | `GET` | `publicMockTest.controller.js`| None | Get public mock test by ID |
| **`/api/submissions`**| | | | |
| `/submit` | `POST` | `submissions.controller.js`| `verifyUserToken`, Rate Limit (5/min) | Submit practice section |
| `/my-submissions` | `GET` | `submissions.controller.js`| `verifyUserToken` | Fetch student's practice labs |
| `/upload-signature`| `GET` | `submissions.controller.js`| `verifyUserToken` | Cloudinary signature generator |
| `/` | `GET` | `submissions.controller.js`| `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | List submissions (Paginated) |
| `/review/:id` | `PATCH` | `submissions.controller.js`| `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Submit grades and feedback |
| `/lock/:id` | `PATCH` | `submissions.controller.js`| `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Lock submission for grading |
| `/:id` | `DELETE`| `submissions.controller.js`| `verifyUserToken`, `verifyUserRole(['admin'])` | Delete practice submission |
| **`/api/chatbot`** | | | | |
| `/settings` | `GET` | `chatbot.controller.js` | None | Get active status & message config |
| `/settings` | `PUT` | `chatbot.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Update message configurations |
| `/chat` | `POST` | `chatbot.controller.js` | None (Client/Guest) | Send prompt message to AI Tutor |
| **`/api/resources`**| | | | |
| `/` | `GET` | `resource.controller.js` | None (Public) | Fetch active resources |
| `/:id/download` | `POST` | `resource.controller.js` | None (Public) | Increment download count |
| `/manage` | `GET` | `resource.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Management resources list |
| `/` | `POST` | `resource.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Create resource card |
| `/:id` | `PUT` | `resource.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Edit resource details |
| `/:id` | `DELETE`| `resource.controller.js` | `verifyUserToken`, `verifyUserRole(['admin', 'instructor'])` | Delete resource |
| **`/api/error-logs`** | | | | |
| `/client` | `POST` | `errorLog.controller.js` | None (Public) | Write client-side error to database |
| `/` | `GET` | `errorLog.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Retrieve logs |
| `/` | `DELETE`| `errorLog.controller.js` | `verifyUserToken`, `verifyUserRole(['admin'])` | Flush logs database |

---

## 7. Google Analytics 4 (GA4) Telemetry

Google Analytics 4 is integrated on the client-side via `react-ga4` to capture telemetry and track features.

### Analytics Helper (`frontend/src/utils/analytics.js`)
- **`initGA()`**: Reads the Google Measurement ID. Enables `debug_mode` automatically in local development mode so activity can be audited in Google Analytics DebugView.
- **`logPageView(path)`**: Dispatches page tracking. Automates route changes via the `ScrollToTop.jsx` layout wrapper.
- **`logGAEvent(name, params)`**: Dispatches custom events (e.g., checkout initialization `begin_checkout`, test starts `test_start`, submissions `test_submit`, and auto-submissions triggered by tab switches `test_auto_submitted_violation`).

---

## 8. Client-Side Global Error Telemetry

To ensure system stability, client-side errors (runtime exceptions and network failures) are reported back to the server:

- **Error Logger Client ([errorLogger.js](file:///g:/project/MOCKEA/frontend/src/utils/errorLogger.js)):**
  - Defines `logErrorToBackend(error, extraDetails)`.
  - Captures Axios responses, adding request methods, query URLs, request bodies, and backend error messages to the trace.
  - Automatically fetches the active user's Firebase ID token (when authenticated) and attaches it to the request.
  - Posts payload details to `/api/error-logs/client`.
  - Features recursive safety checks to prevent infinite loops if the logging request itself fails.
- **Automated Capture:**
  - `setupGlobalErrorLogging()` attaches global listeners to the `window` object for unhandled runtime errors (`error` event) and unhandled promise rejections (`unhandledrejection` event).

---

## 9. Reusable UI Components & Custom Hooks

The frontend employs a modular design system. Below is a catalog of the reusable structures:

### A. Custom React Hooks (`frontend/src/hooks/`)

#### **[useCountdown.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useCountdown.jsx)**
An exam timer with countdown logic.
- **Arguments**: `(initialSeconds, active, submitted, onExpiry)`
- **Behavior**: Uses a `useRef` to store the `onExpiry` callback, preventing interval resets when callbacks change.
- **Returns**: `{ timeLeft, setTimeLeft, fmtTime, resetCountdown }`

#### **[useAnswers.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useAnswers.jsx)**
Manages answer states for IELTS/PTE modular tests.
- **Returns**: `{ answers, setAnswers, handleAnswerChange, resetAnswers }`

#### **[useAdminQuery.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useAdminQuery.jsx)**
A wrapper around TanStack Query's `useQuery`.
- **Arguments**: `(queryKey, endpoint, dataKey, options = {})`
- **Behavior**: Automatically includes the authenticated `axiosSecure` instance. Default `staleTime` is set to 2 minutes.
- **Returns**: `{ ...queryInfo, queryClient }`

#### **[useFormModal.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useFormModal.jsx)**
Manages dashboard forms (add/edit modal forms).
- **Arguments**: `(initialState)`
- **Returns**: `{ isOpen, formData, setFormData, openModal, closeModal, handleChange }`

#### **[useUserProfile.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useUserProfile.jsx)**
Fetches and caches the authenticated user's database profile (plan tier, role, target exam).
- **Behavior**: Enabled only when user's email is present. `staleTime` is set to 5 minutes.
- **Returns**: `{ userData, isLoading, refetch }`

#### **[useAxiosSecure.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useAxiosSecure.jsx)**
Creates an Axios instance configured with request and response interceptors.
- **Behavior**:
  - Request: Injects Firebase Authorization token (`Bearer <token>`).
  - Response: Logs out and redirects the user to `/auth/login` on `401/403` errors. Displays a warning modal on `429 Too Many Requests`.

#### **[useFullscreen.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useFullscreen.jsx)**
Handles browser fullscreen states.
- **Returns**: `{ isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen }`

#### **[useTestIntegrity.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useTestIntegrity.jsx)**
Protects the test-taking environment.
- **Behavior**: Scrolls the window and scrollable divs to the top on start, monitors fullscreen exits during tests, and triggers warning overlays.
- **Returns**: `{ isFullscreen, showWarning, setShowWarning, enterFullscreen, exitFullscreen }`

---

### B. Presentational UI Components (`frontend/src/components/Common/`)

#### **[PageHeader.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/PageHeader.jsx)**
A standardized header panel for dashboard pages.
- **Props**: `preTitle`, `title`, `subtitle`, `icon`, `action`, `className`

#### **[TableShell.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/TableShell.jsx)**
Wraps list tables to handle state changes.
- **Props**: Handles loading animations, error screens with retry actions, and empty states.

#### **[HoverActions.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/HoverActions.jsx)**
Provides hover-to-reveal action buttons (Edit, Delete, View) for table rows.
- **Props**: `onEdit`, `onDelete`, `onView`, `extra`

#### **[AdminModal.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/AdminModal.jsx)**
A highly flexible modal layout.
- **Props**: Supports centered dialogs or side drawer slide-overs, headers, footers, custom widths, and Framer Motion animation fades.

#### **[TestShell.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/TestShell.jsx)**
A container shell wrapping active test layouts.
- **Behavior**: Blocks right-click context menus (`e.preventDefault()`), disables text selection, and overlays warnings if integrity constraints are violated.

#### **[alerts.js](file:///g:/project/MOCKEA/frontend/src/utils/alerts.js)**
A catalog of SweetAlert2 modal actions configured to match MOCKEA's design language.
- Exposes `success`, `error`, `confirmDelete`, `confirmExitPractice`, `confirmExitMockTest`, `confirmTerminateMockTest`, and `confirmCancelPractice`.

#### **[markdownUtils.js](file:///g:/project/MOCKEA/frontend/src/utils/markdownUtils.js)**
A parser utility that safely converts raw markdown text into styled HTML markup.
- Converts markdown images, links, plain URLs, paragraphs, and markdown tables.

---

## 10. Routing & Layout Architecture

Registered routes are defined in [router.jsx](file:///g:/project/MOCKEA/frontend/src/Router/router.jsx):

```text
                  [RootLayout]
                       │
      ┌────────────────┴────────────────┐
 [HomeLayout]                     [AuthLayout]
  (Public: /,                     (Auth: Login,
   pricing, about...)              Register)
                       │
                       ├─ [PrivateRoute]
                       │        │
                       │   [DashboardLayout]
                       │        │
                       │        ├─ Students (practice, review...)
                       │        ├─ [AdminRoutes] (manage-users, mock-tests...)
                       │        └─ [InstructorRoutes] (grade-submissions...)
                       │
                       └─ [FreePracticeLayout]
                            (Guest: test-library, env)
```

- **Vite Code Splitting:** 34 page modules use `lazy(() => import(...))` dynamic importing to minimize bundle sizes.
- **Layout Wrappers:** `RootLayout` sets up global contexts, Toast containers, and error boundaries. Sub-layouts handle responsive sidebars.

---

## 11. Developer Local Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the local `.env` file with MongoDB, Firebase Admin, Redis, and Cloudinary keys:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_uri
   REDIS_URL=your_redis_connection_uri
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   CLIENT_URL=http://localhost:5173
   DEV_URL=http://localhost:5173
   ```
4. Run using PM2 clustering:
   ```bash
   pm2 start ecosystem.config.cjs
   ```
   Or run the standard dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the local `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_GA_MEASUREMENT_ID=your_ga4_measurement_id
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Build the production bundle to verify chunk sizes:
   ```bash
   npm run build
   ```
