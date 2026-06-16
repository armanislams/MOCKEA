# MOCKEA User Documentation

Welcome to MOCKEA, the ultimate IELTS mock test platform. This guide provides a step-by-step walkthrough for Students, Instructors, and Administrators to navigate and utilize the website effectively.

---

## Table of Contents
1. [General: Registration & Login](#general-registration--login)
2. [Student Guide](#student-guide)
   - [Dashboard Overview](#student-dashboard-overview)
   - [Practice Labs](#practice-labs)
   - [Full Mock Tests](#full-mock-tests)
   - [Review & Feedback](#review--feedback)
   - [Analytics](#student-analytics)
3. [Instructor Guide](#instructor-guide)
   - [Instructor Dashboard](#instructor-dashboard)
   - [Review Center (Grading)](#review-center-grading)
   - [Providing Feedback](#providing-feedback)
4. [Admin Guide](#admin-guide)
   - [User Management](#user-management)
   - [Content Management](#content-management)
   - [System Settings & Analytics](#system-settings--analytics)
   - [Google Analytics 4 Monitoring](#google-analytics-4-monitoring)

---

## General: Registration & Login

### Creating an Account
1. Click the **Register** button on the home page.
2. Fill in your details (Name, Email, Password).
3. Select your goal/role if prompted.
4. Once registered, you will be redirected to the Home page or Dashboard.

### Logging In
1. Click the **Login** button.
2. Enter your credentials or use Social Login (if enabled).
3. After a successful login, you will be automatically directed to your role-specific dashboard.

---

## Student Guide

The Student Dashboard is designed to help you prepare for the IELTS exam through targeted practice and full mock simulations.

### Student Dashboard Overview
Upon logging in, you'll see your **Dashboard Home** which displays:
- **Total Tests Taken**: Summary of your activity.
- **Average Band Score**: Your current performance level.
- **Recent Activity**: Quick links to your latest tests.

### Practice Labs
Practice individual modules to sharpen specific skills:
1. Navigate to **Take a Test** in the sidebar.
2. Select a module: **Reading**, **Listening**, **Writing**, or **Speaking**.
3. Choose a specific question or set from the list.
4. Complete the exercise and click **Submit**.
   - *Note: Reading and Listening are auto-graded.*
   - *Note: Writing and Speaking require instructor review.*

### Full Mock Tests
Simulate the real IELTS experience:
1. Go to **Full Mock Test** in the sidebar.
2. Choose an available Mock Test from the library.
3. **Environment**: Ensure you are in a quiet place. The test environment tracks fullscreen mode and tab switching to prevent cheating.
4. Complete all four modules in sequence.
5. Your progress is saved automatically.

### Review & Feedback
1. Navigate to the **Review** section.
2. Here you can see a list of all your submitted tests.
3. Click on a test to view:
   - **Correct/Incorrect Answers** (Reading/Listening).
   - **Instructor Feedback & Band Score** (Writing/Speaking).
   - **Model Answers** for comparison.

### Student Analytics
1. Go to **Analytics** to see your progress over time.
2. View charts showing your band score trends across different modules.
3. Identify your strengths and weaknesses to focus your study.

---

## Instructor Guide

Instructors are responsible for evaluating student submissions for Writing and Speaking modules.

### Instructor Dashboard
The **Dashboard Home** for instructors provides:
- **Pending Reviews**: A count of submissions waiting for your grade.
- **Completed Reviews**: Your history of graded tests.
- **Student Performance Overview**: Analytics on students you've graded.

### Review Center (Grading)
1. Navigate to the **Review Center** in the sidebar.
2. You will see a list of student submissions (Writing tasks or Speaking recordings).
3. **Locking a Submission**: Click "Lock" on a submission to ensure other instructors don't grade the same one simultaneously.
4. Click **Review** to open the submission.

### Providing Feedback
1. **Analyze**: Read the student's writing or listen to the speaking recording.
2. **Grade**: Assign a Band Score (0-9) based on IELTS criteria.
3. **Feedback**: Write professional feedback.
   - Use the **Feedback Templates** for quick comments.
   - Provide specific advice on Task Response, Cohesion, Vocabulary, and Grammar.
4. **Submit**: Click "Publish Review" to send the results to the student.

---

## Admin Guide

Administrators have full control over the platform's users, content, and system health.

### User Management
1. Navigate to **Manage Users**.
2. **Roles**: Change user roles (Student, Instructor, Admin).
3. **Subscriptions**: Update user plans (Basic, Pro, Elite).
4. **Account Status**: Ban or unban users who violate platform policies.
5. **Search**: Find users by name or email.

### Content Management
- **Manage Questions**: Add, edit, or delete individual questions for Practice Labs.
- **Manage Mock Tests**: Create full-length mock tests by combining existing questions.
- **Question Categories**: Organize questions by difficulty and type (e.g., T/F/NG, Matching, Essay).

### System Settings & Analytics
1. **System Analytics**: Monitor server health, CPU usage, memory, and total platform traffic.
2. **Error Logs**: View a list of recent backend errors to troubleshoot technical issues.
3. **Global Settings**:
   - Maintenance Mode toggle.
   - Update platform-wide constants (e.g., Pricing, Contact Info).

### Google Analytics 4 Monitoring
Google Analytics 4 (GA4) tracks student traffic, conversions, and platform behavior client-side.
1. **Data Collected Anonymously**:
   - **Pageviews**: Monitor which sections (e.g., Practice, Mock Tests, Pricing) get the most visits.
   - **User Activity**: Tracks actions such as test initiation (`test_start`), test completion (`test_submit`), and subscription checkouts (`begin_checkout`).
   - **Anti-Cheat Logs**: Captures when tests are automatically submitted due to safety/anti-cheat tab switches.
   - **System Stability**: Tracks unhandled client runtime crashes (`exception` events) to help you monitor site health.
2. **Accessing Insights**:
   - Log into your Google Analytics dashboard mapped to your Measurement ID.
   - Use the **Realtime** report to see immediate activity or **DebugView** to verify test environments and active user session states.

---

## Support
If you encounter any issues:
- Check your **Profile** to ensure your subscription is active.
- Use the **Help/Support** link in the footer of the home page.
- Contact the administrator at support@mockea.com.
