# Implementation Plan (Revised with Review Comments) - Dedicated UI/UX for IELTS and PTE Sublinks

This plan outlines the steps required to separate IELTS and PTE UI/UX, restrict student profile selection to strictly IELTS or PTE, and build a dedicated landing page for PTE prep.

## User Review Required

> [!IMPORTANT]
> **PTE Folder Structure**:
> - All frontend code, components, layouts, and assets related to PTE will be consolidated and live inside a parent folder named `pte` at `frontend/src/pte`.
> 
> **Sublink Structure**: 
> - The paths will be directly at `/ielts` and `/pte` (e.g., `mockea.web.app/ielts` and `mockea.web.app/pte`).
> 
> **Authentication Flash Protection**:
> - We will enforce a full loading/spinner state while authentication context determines preference, preventing flashes of the Guest Portal for logged-in users.
> 
> **Route Guarding**:
> - Route guards will block student users with `IELTS` preferences from viewing `/pte` paths (and vice-versa), redirecting them back to their preferred preparation track.
> 
> **Admin Context Switcher**:
> - Admins and Instructors need to test and view both portals. We will implement a persistent, toggle-able "Active Context" selection in the Navbar (backed by React state or session storage) to allow them to toggle between IELTS/PTE layouts seamlessly.

## Proposed Changes

### Component 1: Consolidation of PTE Code

#### [NEW] [pte Directory](file:///g:/project/MOCKEA/frontend/src/pte)
- Move and organize all PTE-related components and views here:
  - `PteHome.jsx`
  - `PteHero.jsx`
  - `PteLandingStack.jsx`
  - `PteHowItWorks.jsx`
  - `PtePricing.jsx`
  - `PteTaskCards.jsx`
  - Any future PTE-specific pages or sections.

---

### Component 2: Routing, Guards, & Portal Redirection

#### [MODIFY] [router.jsx](file:///g:/project/MOCKEA/frontend/src/Router/router.jsx)
- Map `/ielts` to the existing IELTS home components (which are currently mounted at `/`).
- Keep `/pte` mapped to the new path: `../pte/PteHome`.
- Wrap both `/ielts` and `/pte` sub-routes in a route guard component (`TrackGuard.jsx`) to enforce preference matching for students.
- Set the root `/` path to a redirect component (`ExamPreferenceRedirect.jsx`).

#### [NEW] [ExamPreferenceRedirect.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/ExamPreferenceRedirect.jsx)
- Handles the entrypoint at `/`:
  - **Auth Loading State**: First check if authentication state/profile retrieval is loading. If so, display a clean loading spinner to prevent auth flash.
  - **Authenticated Users**: Redirect to their profile preference (`/pte` or `/ielts`).
  - **Unauthenticated (Guests)**: Check local storage for a previously selected track. If present, redirect to it. Otherwise, render a selection portal for the guest to pick "IELTS Prep" or "PTE Prep", store it, and redirect.

#### [NEW] [TrackGuard.jsx](file:///g:/project/MOCKEA/frontend/src/components/Common/TrackGuard.jsx)
- Wraps `/ielts` and `/pte` routes:
  - If user is authenticated and is a student:
    - If trying to access `/pte` but preference is `"IELTS"`, replace URL with `/ielts`.
    - If trying to access `/ielts` but preference is `"PTE"`, replace URL with `/pte`.
  - Non-students (Admins, Instructors) are bypassed and allowed access to both tracks.

#### [MODIFY] [Navbar.jsx](file:///g:/project/MOCKEA/frontend/src/components/Home/Navbar.jsx)
- Update NavLinks to correctly navigate to `/ielts` or `/pte` depending on the active exam mode.
- For Admins and Instructors, provide a persistent UI switcher in the navbar to switch their active viewing context, altering which portal layouts are active.

---

### Component 3: Profile Update (Frontend Restrictions)

#### [MODIFY] [Profile.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Profile.jsx)
- In the dropdown selector for `targetExam`, filter out the `"BOTH"` option for student roles. Students can only select **IELTS Preparation** or **PTE Academic Preparation**.

#### [MODIFY] [user.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/user.controller.js)
- Ensure backend validation of `updateUserExamPreference` allows `IELTS` and `PTE` for students.

---

### Component 4: PTE Landing Page Enhancement (Under `src/pte/`)

#### [MODIFY] [PteHome.jsx](file:///g:/project/MOCKEA/frontend/src/pte/PteHome.jsx) (and sub-components under `src/pte/`)
- Improve UI styling and design to align with references (Pearson PTE, Alfa PTE).
- Include elements like:
  - Sleek PTE Academic modules representation (Speaking & Writing, Reading, Listening).
  - Clean CTA sections offering full mock tests.
  - Score comparison charts (PTE vs. IELTS vs. TOEFL).
  - Modern styling with clean blue/teal Pearson-inspired color palettes, micro-animations using Framer Motion, and rich typography.

## Verification Plan

### Automated Tests
- Run backend linting and verify that profile updates succeed.

### Manual Verification
- Log in and change test type in Profile settings. Verify student redirects behavior on visiting `/`.
- Test manual URL entry (e.g. going to `/pte` while having an IELTS preference). Confirm correct replacement redirect.
- Log in as admin and verify the persistent context switcher changes active layouts correctly.
