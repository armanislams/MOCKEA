# Implementation Plan - Instructor Performance Analytics

This plan outlines the design and integration steps to add an **Instructor Performance Dashboard** to the Admin Panel. This feature will track review counts, average grading turnaround time (TAT), and average band scores assigned by tutors, excluding any payout details.

---

## Proposed Changes

### 1. Database Model Updates
We need to capture the exact timestamp of mock test section reviews to measure tutor responsiveness.

#### [MODIFY] [mockTestResult.js](file:///g:/project/MOCKEA/backend/src/model/mockTestResult.js)
- Add `reviewedAt: Date` to the schema inside the `sectionResults` array.

---

### 2. Backend Controller Modifications
We will record review timestamps when a section is graded and build the analytics aggregation logic.

#### [MODIFY] [mockTest.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/mockTest.controller.js)
- Update the `gradeSection` controller to record `section.reviewedAt = new Date()` before saving the result.

#### [MODIFY] [analytics.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/analytics.controller.js)
- Implement a new controller function `getInstructorPerformance` that:
  - Finds all users with the role `"instructor"`.
  - Aggregates the count of completed reviews in `PracticeSubmission` and `MockTestResult` for each instructor.
  - Computes the average Turnaround Time (TAT) in hours using:
    - Practice: `reviewedAt - createdAt`
    - Mock Section: `reviewedAt - completedAt`
  - Computes the average band score assigned by each instructor.

---

### 3. API Route Configuration
Expose the new performance metrics to admin users securely.

#### [MODIFY] [analytics.route.js](file:///g:/project/MOCKEA/backend/src/routes/analytics.route.js)
- Register `GET /instructor-performance` restricted to admins:
  ```javascript
  analyticsRouter.get("/instructor-performance", verifyUserRole(["admin"]), getInstructorPerformance);
  ```

---

### 4. Frontend View & Routing

#### [NEW] [InstructorPerformance.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Admin%20Dashboard/InstructorPerformance.jsx)
- A modern UI displaying:
  - Stat cards showing total overall reviews graded, average platform turnaround time, and total active instructors.
  - A table of instructors with columns: Tutor Name, Email, Graded Practices, Graded Mock Sections, Avg Turnaround Time (hours), Avg Band Score Given.
  - Visual color indicators for turnaround performance (e.g. green for <12h, yellow for 12-24h, red for >24h).

#### [MODIFY] [router.jsx](file:///g:/project/MOCKEA/frontend/src/Router/router.jsx)
- Import and register the `InstructorPerformance` lazy component at route `/dashboard/admin/instructor-performance`.

#### [MODIFY] [AdminDashboard.jsx](file:///g:/project/MOCKEA/frontend/src/components/RoleBasedSidebar/AdminDashboard.jsx)
- Add a sidebar navigation item "Tutor Performance" (using `PiGraduationCap` or a custom icon) linked to `/dashboard/admin/instructor-performance`.

---

## Verification Plan

### Automated Tests
- Validate endpoint access controls (verify that a student/instructor cannot access `/api/analytics/instructor-performance`).
- Test turnaround calculations: verify correctness of aggregated data using test fixtures.

### Manual Verification
- Grade a mock test section and practice submission as an instructor.
- Access the Admin panel under a test administrator account, open "Tutor Performance", and verify the instructor metrics updated correctly.
