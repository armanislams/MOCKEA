# Allow Public Access to Mock Tests for Non-Users with Forced Login on Submit

This plan describes how to let guests start public mock tests, but require authentication before final submission so their attempt is processed like a normal logged-in user.

## User Review Required

> [!IMPORTANT]
> Guests can preview and answer the speaking and Listening sections without logging in, but when they submit the test they must authenticate first. Once they sign in, the submission should be handled through the same authenticated test flow used by logged-in users.

// user review
Guests may begin a public mock test anonymously, but final submission requires login. After authentication, progress should continue and the attempt should be saved like a normal user attempt.

## Open Questions

1. **Placement of Public Tests:** Where should unauthenticated users find these public tests? I recommend adding a "Free Practice" link to the main landing page.
2. **Admin Control:** Should admins be able to toggle `isPublic` on existing tests? I recommend enabling this in both Create and Manage screens.

## Proposed Changes

---

### Backend Components

#### [MODIFY] `backend/src/model/mockTest.js`
- Add `isPublic: { type: Boolean, default: false }` to the `mockTestSchema`.

#### [NEW] `backend/src/controllers/publicMockTest.controller.js`
- Create controllers for public access:
  - `getPublicMockTests`: Returns tests where `isPublic: true`.
  - `getPublicMockTestById`: Returns a single public test with its questions.
- Do not add a separate guest evaluation endpoint. Guests will authenticate before submission and use the existing authenticated submission endpoints.

#### [NEW] `backend/src/routes/publicMockTest.route.js`
- Define public read-only endpoints:
  - `GET /` → public test list
  - `GET /:id` → public test detail
- These routes will not use `verifyUserToken`.

#### [MODIFY] `backend/src/index.js`
- Mount the new router at `/api/public-mock-tests`.

---

### Frontend Admin Components

#### [MODIFY] `frontend/src/components/Dashboard/Admin Dashboard/CreateMockTest.jsx`
- Add `isPublic` to the form state.
- Add a checkbox/switch for "Make this test public".
- Include `isPublic` in the creation payload.

#### [MODIFY] `frontend/src/components/Dashboard/Admin Dashboard/ManageMockTests.jsx`
- Display a badge or label when a test is public.
- Optionally add a toggle to update `isPublic` if the backend supports it.

---

### Frontend Guest Components

#### [NEW] `frontend/src/components/Guest/GuestTestLibrary.jsx`
- Public page listing all `isPublic` mock tests.
- Accessible without login.
- Display title, duration, and Reading/Listening availability.

#### [NEW] `frontend/src/components/Guest/GuestTestEnvironment.jsx`
- Guest-facing test page for `/free-practice/:id`.
- Fetch public test data from `/api/public-mock-tests/:id`.
- Allow answering Reading and Listening sections in browser state.
- Persist state locally using `localStorage` under a key like `guest_public_test_${testId}` with:
  - `answers`
  - `currentSection`
  - `timeLeft`
  - `testId`
  - `resultId` (if created after login)
  - `pendingSubmit` flag
- Load persisted state automatically when the user returns or after login.
- On submit, if the user is not authenticated, show a centered login/register popup/modal that:
  - explains the user must sign in to save results,
  - offers buttons for `Login` and `Register`,
  - keeps the current test state intact while authentication occurs,
  - includes a `Continue Without Saving` secondary option only if explicitly desired.
- After authentication, refresh frontend auth state, close the modal, restore saved test state, and continue submission using the existing authenticated endpoints (`/api/mock-tests/start`, `/api/mock-tests/submit-section`, `/api/mock-tests/finalize`).

#### [NEW] `frontend/src/components/Guest/GuestResult.jsx`
- Display the confirmed result after login-based submission.
- Explain that Writing/Speaking grading and analytics require a user account.

#### [MODIFY] `frontend/src/Router/router.jsx`
- Add public routes:
  - `/free-practice` → `GuestTestLibrary`
  - `/free-practice/:id` → `GuestTestEnvironment`
  - `/guest-result` → `GuestResult`

---

## Submission Flow

1. Guest visits `/free-practice` and selects a public test.
2. Guest starts the test and answers Reading and Listening.
3. Save progress continuously in `localStorage` so keys are available on refresh or after login.
4. When the guest taps submit:
   - if unauthenticated, open a login/register modal overlay,
   - the modal shows a short message: "Please sign in to save and submit your mock test. Your progress is preserved.",
   - allow the user to login or register without losing test state,
   - keep the browser test page visible behind the modal so the user understands the flow.
5. After successful authentication:
   - automatically refresh auth/user state in the frontend,
   - close the popup,
   - restore saved test state from `localStorage`,
   - proceed with the authenticated submission flow using the normal endpoints:
     - `/api/mock-tests/start` if no `resultId` exists,
     - `/api/mock-tests/submit-section` for Reading and Listening,
     - `/api/mock-tests/finalize`.
6. Save the backend `resultId` back into persisted state so the test can continue after page refresh.
7. The completed attempt is stored and graded like any logged-in user submission.

---

## Verification Plan

### Manual Verification
1. Visit the platform anonymously.
2. Open `Free Practice` and view public tests.
3. Start a public test and complete Reading and Listening.
4. Attempt to submit: confirm the app requires login.
5. Log in or register, then confirm the test resumes and submits normally.
6. Verify the completed attempt is saved in the database and visible like a regular user result.
7. Log in as admin and confirm `isPublic` can be set for a test.
