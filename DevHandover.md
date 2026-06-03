# MOCKEA Developer Handover Documentation

This document provides a comprehensive technical overview of the MOCKEA platform for developers. It covers the system architecture, backend routes, controllers, frontend components, and the logic governing core features.

---

## 1. System Overview
MOCKEA is a full-stack web application built on the **MERN** stack (MongoDB, Express, React, Node.js).
- **Frontend**: Vite + React + Tailwind CSS + DaisyUI.
- **Backend**: Node.js + Express.
- **Database**: MongoDB (Mongoose).
- **Authentication**: Firebase Authentication + JSON Web Tokens (JWT) for secure API access.
- **State Management**: React Context API + TanStack Query (for server state).
- **Analytics**: Google Analytics 4 (GA4) client-side standalone integration via `react-ga4` (independent of Firebase SDK).

---

## 2. Database Schemas (`backend/src/model/`)

The system relies on a relational-like structure using MongoDB ObjectIds for cross-referencing.

### **Questions (`questions.js`)**
Stores individual test modules.
- **`testType`**: Enum (`reading`, `listening`, `writing`, `speaking`). This dictates which fields are populated.
- **`passage`**: Used for Reading modules.
- **`audioUrl`**: Used for Listening modules.
- **`questions`**: An array of `QuestionItemSchema` objects.
    - Each item has a `type` (e.g., `multiple-choice`, `true-false`, `matching`).
    - **`correctAnswer`**: The literal string used for auto-grading.

### **MockTest (`mockTest.js`)**
Acts as a "Container" for a full IELTS exam.
- **`sections`**: An object containing arrays of ObjectIds referencing the `Questions` collection for each of the four modules.
- **`totalDuration`**: Total time allowed for the full test (usually 165 minutes).

### **MockTestResult (`mockTestResult.js`)**
Tracks a student's attempt at a full mock test.
- **`sectionResults`**: Stores answers for each module.
    - **`isGraded`**: Boolean flag. Set to `true` automatically for Reading/Listening, or manually by an instructor for Writing/Speaking.
- **`tabSwitchCount` & `fullscreenExits`**: Integrity counters used for anti-cheat enforcement.
- **`lockedBy`**: Stores the `userId` of an instructor currently grading the test to prevent concurrent edits.

---

## 3. Backend Controllers & Data Fetching

### **Mock Test Controller (`mockTest.controller.js`)**
- **`getAllMockTests`**: Uses `.populate()` to fetch full question details for the library view.
- **`finalizeTest`**: 
    1. Fetches the `MockTestResult` and the original `MockTest` (with questions).
    2. Loops through `sectionResults`.
    3. For `reading` and `listening`, it compares `userAnswer` against the `correctAnswer` from the `Questions` model.
    4. Calculates the `score` (raw count) and marks the section as `isGraded: true`.
- **`lockMockResult`**: Implements a 1-hour lock. If `lockExpiresAt > now`, other instructors are blocked from opening the grading interface for that specific result.

### **Submission Controller (`submissions.controller.js`)**
- Handles standalone practice lab submissions.
- Uses a similar locking mechanism to `mockTest.controller.js` for manual instructor review.

---

## 4. API Routes & Frontend Usage

| Route Endpoint | Frontend Component | Purpose |
| :--- | :--- | :--- |
| `GET /api/user/:email/role` | `useRole.jsx` (Hook) | Decides which dashboard to show. |
| `GET /api/mock-tests` | `FullMockTestLibrary.jsx` | Populates the list of available tests. |
| `GET /api/mock-tests/:id` | `TestEnvironment.jsx` | Loads questions for the active test session. |
| `POST /api/mock-tests/start` | `TestEnvironment.jsx` | Creates the `MockTestResult` entry in DB. |
| `POST /api/mock-tests/finalize`| `TestEnvironment.jsx` | Triggers auto-grading and completes session. |
| `GET /api/submissions` | `GradeSubmissions.jsx` | Fetches pending Writing/Speaking for instructors. |

---

## 5. Test Environment Logic (`frontend/.../FullMockTest/`)

### **The Test Environment (`TestEnvironment.jsx`)**
This is the "Mission Control" for the exam simulator.
1. **State Management**: Manages the master timer, current module index (0-3), and anti-cheat counters.
2. **Crash Recovery**: Every answer change and timer tick is synced to `localStorage` under `test_cache_${testId}`. If the browser crashes, the state is restored upon re-entry.
3. **Sequence**: It renders `ReadingSection`, `ListeningSection`, `WritingSection`, and `SpeakingSection` sequentially.

### **Anti-Cheat System**
- **Fullscreen Enforcement**: The test only starts if the user enters fullscreen.
- **Listeners**:
    - `visibilitychange`: Detects when a user switches tabs or minimizes the window.
    - `fullscreenchange`: Detects when the user exits the exam environment.
- **Enforcement**: On the 3rd tab switch, the `TestEnvironment` calls `handleFinalSubmit()` automatically, terminating the test.

### **Test Submissions**
- **Reading/Listening**: Answers are captured as simple key-value pairs (`questionId: answerText`).
- **Writing**: Captured as a text string from a textarea.
- **Speaking**: Handled as a recording (or placeholder depending on specific implementation).
- **Finalization**: When the student clicks "Finish", the frontend sends a `finalize` request. The backend then performs the auto-grading logic described in Section 3.

---

## 6. Instructor Review Flow
1. **Discovery**: Instructors view "Pending Reviews" in their dashboard.
2. **Locking**: Clicking "Review" calls the `/lock` endpoint. This prevents "double-grading".
3. **Grading**: The instructor provides a Band Score (0-9) and text feedback.
4. **Publishing**: The `/grade-section` endpoint updates the `MockTestResult`, sets `isGraded: true`, and releases the lock.

---

## 7. Development Setup

### Backend
1. `cd backend && npm install`
2. Configure `.env` (Mongo URI, Firebase Admin SDK).
3. `npm start`

### Frontend
1. `cd frontend && npm install`
2. Configure `.env` (Vite API URL, Firebase Config, Google Analytics ID).
3. `npm run dev`

---

## 8. Google Analytics 4 (GA4) Standalone Integration

Google Analytics 4 is integrated as a standalone client-side tracking solution using the `react-ga4` package. It does not require the Firebase Analytics SDK.

### **Utility Helper (`frontend/src/utils/analytics.js`)**
All analytics functions are encapsulated in a single file to keep the codebase clean:
- **`initGA()`**: Reads `VITE_GA_MEASUREMENT_ID` from the environment. In development mode (`import.meta.env.DEV`), it enables `debug_mode` automatically so event activity can be audited instantly in the GA4 DebugView.
- **`logPageView(path)`**: Dispatches pageview parameters to GA4.
- **`logGAEvent(eventName, params)`**: Triggers standard or custom events in snake_case format.
- **`setGAUserId(userId)`**: Associates the current user session with their anonymized Firebase UID.

### **Tracking Points**
1. **Route Pageviews**: Handled inside `ScrollToTop.jsx` on every route change, automating SPA page tracking.
2. **Authentication Flow**: Managed in `AuthProvider.jsx`. Sets the anonymized `userId` on successful login and tracks a standard `login` event. Clears the ID on logout.
3. **Exam Environment (`TestEnvironment.jsx`)**:
   - `test_start`: Fired when a student opens a mock test.
   - `test_submit`: Fired when a student finishes the mock test.
   - `test_auto_submitted_violation`: Fired on safety/anti-cheat tab switches (e.g., 3rd infraction).
4. **Checkout Conversion (`Pricing.jsx`)**:
   - `begin_checkout`: Dispatched when a student initiates a membership tier checkout.
5. **System Crash Logs (`errorLogger.js`)**:
   - `exception`: Forwards unhandled client-side runtime errors to the GA4 dashboard.
