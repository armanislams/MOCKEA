# Implementation Plan: MOCKEA Platform Optimization & Security Plan

Create a robust security, performance, and scalability plan for the MOCKEA IELTS application. This plan addresses critical BOLA/IDOR security gaps on the backend, optimizes bundle loading performance on the frontend, and scales list fetching using database pagination.

## Proposed Changes

We will restructure both the frontend and backend modules.

---

### Part 1: Security & Route Protections (Backend)

We will tighten route security on the backend by applying ownership checks, role gates, and verifying request payloads against JWT tokens.

#### [MODIFY] [user.route.js](file:///g:/project/MOCKEA/backend/src/routes/user.route.js)
- Move `/all` under an admin-only role gate: `verifyUserRole(["admin"])`.
- Secure other routes like `/:id/exam-preference` and `/:email` with controller checks.

#### [MODIFY] [user.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/user.controller.js)
- In `getUserProfile`, verify that `req.decoded_email === req.params.email` OR the requestor is an admin.
- In `updateUserExamPreference`, retrieve user by `id` first and verify ownership: `req.decoded_email === user.email` OR the requestor is an admin.

#### [MODIFY] [submissions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/submissions.controller.js)
- In `submitPractice`, overwrite `userEmail` and `userName` fields in the generated `PracticeSubmission` instance with `req.decoded_email` and `req.user.name` respectively to prevent client spoofing.

---

### Part 2: Frontend Performance & Reliability (Frontend)

We will improve client-side load times and eliminate token-expiry bugs by implementing route splitting and async Firebase ID token retrieval.

#### [MODIFY] [router.jsx](file:///g:/project/MOCKEA/frontend/src/Router/router.jsx)
- Convert eager imports of dashboard pages (e.g. `ManageUsers`, `ManageQuestions`, `TestEnvironment`, `GradeSubmissions`, etc.) into dynamic imports using React's `lazy` or React Router v7's routing features.
- Wrap route components in `<Suspense fallback={<Loader />}>` for a smooth page-loading experience.

#### [MODIFY] [useAxiosSecure.jsx](file:///g:/project/MOCKEA/frontend/src/hooks/useAxiosSecure.jsx)
- Update the request interceptor to asynchronously call `await user.getIdToken()` to fetch/refresh the Firebase JWT token instead of using the static, short-lived `user.accessToken` property.

---

### Part 3: Scalability & Database Optimizations (Full Stack)

We will optimize backend query performance and collection indexing to ensure scalability as the userbase and question sets grow.

#### [MODIFY] [user.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/user.controller.js)
- Update `getAllUser` to read `page` and `limit` from `req.query`, and implement mongoose query pagination (e.g., `skip((page-1)*limit).limit(limit)`) alongside total count headers.

#### [MODIFY] [submissions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/submissions.controller.js)
- Update `getSubmissions` to support pagination (`page`, `limit`).

#### [MODIFY] [mockTest.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/mockTest.controller.js)
- Update `getAllResults` to support pagination (`page`, `limit`).

#### [MODIFY] [practiceSubmission.js](file:///g:/project/MOCKEA/backend/src/model/practiceSubmission.js)
- Add a Mongoose index for `userEmail` (`PracticeSubmissionSchema.index({ userEmail: 1 })`) to support the `getMySubmissions` query and avoid collection scans (COLLSCAN).

---

## Verification Plan

### Automated Tests
- Run `cmd /c npm run build` in `g:/project/MOCKEA/frontend` to verify that dynamic chunk splits are successfully generated.
- Run `npm run lint` or `eslint` checks on modified files to verify styling compliance.

### Manual Verification
- Test profile retrieval: verify that a logged-in student receives a `403 Forbidden` error when trying to fetch `/api/user/other-user@email.com`.
- Test dashboard loading: check Chrome DevTools Network tab to confirm that chunks (e.g., `ManageUsers-xxx.js`) are only downloaded when navigating to their respective routes.
- Verify timer, token expiration, and database pagination are functioning properly.
