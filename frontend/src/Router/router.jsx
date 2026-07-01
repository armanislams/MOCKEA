import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Home from "../components/Home/Home";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import HomeLayout from "../Layout/HomeLayout";
import PrivateRoute from "../context/PrivateRoute";
import Loader from "../components/Loader/Loader";
import Error from "../components/Common/Error";
import { AdminRoutes } from "../context/Role Based Routes/AdminRoutes";
import { InstructorRoutes } from "../context/Role Based Routes/InstructorRoutes";
import FreePracticeLayout from "../Layout/FreePracticeLayout";
import AuthLayout from "../components/Auth/AuthLayout";
import RootLayout from "../Layout/RootLayout";
import ExamPreferenceRedirect from "../components/Common/ExamPreferenceRedirect";
import TrackGuard from "../context/TrackGuard";

// Helper for Suspense wrapper
const withSuspense = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

// Lazy Loaded Pages & Layouts
const DashboardLayout = lazy(() => import("../Layout/DashboardLayout"));
const Profile = lazy(() => import("../components/Dashboard/Profile"));
const Review = lazy(() => import("../components/Dashboard/Student Dashboard/Review/Review"));
const ReviewDetail = lazy(() => import("../components/Dashboard/Student Dashboard/Review/ReviewDetail"));
const Analytics = lazy(() => import("../components/Dashboard/Student Dashboard/Analytics/Analytics"));
const Practice = lazy(() => import("../components/Dashboard/Student Dashboard/Practice/Practice"));
const TakeTest = lazy(() => import("../components/Dashboard/Student Dashboard/TakeTest/TakeTest"));
const Reading = lazy(() => import("../components/Dashboard/Student Dashboard/Reading/Reading"));
const Listening = lazy(() => import("../components/Dashboard/Student Dashboard/Listening/Listening"));
const Writing = lazy(() => import("../components/Dashboard/Student Dashboard/Writing/Writing"));
const Speaking = lazy(() => import("../components/Dashboard/Student Dashboard/Speaking/Speaking"));
const DashboardIndex = lazy(() => import("../components/Dashboard/DashboardIndex"));
const ManageUsers = lazy(() => import("../components/Dashboard/Admin Dashboard/ManageUsers"));
const ManageSubmissions = lazy(() => import("../components/Dashboard/Admin Dashboard/ManageSubmissions"));
const AdminSettings = lazy(() => import("../components/Dashboard/Admin Dashboard/AdminSettings"));
const FullMockTestLibrary = lazy(() => import("../components/Dashboard/Student Dashboard/FullMockTest/FullMockTestLibrary"));
const AddQuestionForm = lazy(() => import("../components/Dashboard/Admin Dashboard/AddQuestionForm"));
const EditQuestionForm = lazy(() => import("../components/Dashboard/Admin Dashboard/EditQuestionForm"));
const ManageQuestions = lazy(() => import("../components/Dashboard/Admin Dashboard/ManageQuestions"));
const CreateMockTest = lazy(() => import("../components/Dashboard/Admin Dashboard/CreateMockTest"));
const ManageMockTests = lazy(() => import("../components/Dashboard/Admin Dashboard/ManageMockTests"));
const ManagePricing = lazy(() => import("../components/Dashboard/Admin Dashboard/ManagePricing"));
const ManageResources = lazy(() => import("../components/Dashboard/Admin Dashboard/ManageResources"));
const TestEnvironment = lazy(() => import("../components/Dashboard/Student Dashboard/FullMockTest/TestEnvironment"));
const TrainerLibrary = lazy(() => import("../components/Dashboard/Student Dashboard/TrainerLibrary"));
const ManageTrainers = lazy(() => import("../components/Dashboard/Admin Dashboard/ManageTrainers"));
const GradeSubmissions = lazy(() => import("../components/Dashboard/Instructor Dashboard/GradeSubmissions"));
const GuestTestLibrary = lazy(() => import("../components/Guest/GuestTestLibrary"));
const GuestTestEnvironment = lazy(() => import("../components/Guest/GuestTestEnvironment"));
const PricingPage = lazy(() => import("../components/PricingPage/PricingPage"));
const FreeResourcesPage = lazy(() => import("../components/FreeResources/FreeResourcesPage"));
const CoursesPage = lazy(() => import("../components/Home/CoursesPage"));
const StudentCourses = lazy(() => import("../components/Dashboard/Student Dashboard/StudentCourses"));
const AboutPage = lazy(() => import("../components/AboutPage/AboutPage"));
const PteHome = lazy(() => import("../pte/PteHome"));

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <HomeLayout />,
        hydrateFallbackElement: <Loader />,
        children: [
          {
            index: true,
            element: <ExamPreferenceRedirect />,
          },
          {
            path: "/ielts",
            element: (
              <TrackGuard expectedTrack="IELTS">
                <Home />
              </TrackGuard>
            ),
          },
          {
            path: "/pte",
            element: (
              <TrackGuard expectedTrack="PTE">
                {withSuspense(PteHome)}
              </TrackGuard>
            ),
          },
          {
            path: "/practice",
            element: (
              <PrivateRoute>
                {withSuspense(Practice)}
              </PrivateRoute>
            ),
          },
          {
            path: "/about",
            element: withSuspense(AboutPage),
          },
          {
            path: "/pricing",
            element: withSuspense(PricingPage),
          },
          {
            path: "/free-resources",
            element: withSuspense(FreeResourcesPage),
          },
          {
            path: "/courses",
            element: withSuspense(CoursesPage),
          },
        ],
      },
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
        ],
      },
      {
        path: "/test/:id",
        element: (
          <PrivateRoute>
            {withSuspense(TestEnvironment)}
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            {withSuspense(DashboardLayout)}
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: withSuspense(DashboardIndex),
          },
          {
            path: "practice",
            element: withSuspense(TakeTest),
          },
          {
            path: "full-mock-test",
            element: withSuspense(FullMockTestLibrary),
          },
          {
            path: "review",
            element: withSuspense(Review),
          },
          {
            path: "review/:id",
            element: withSuspense(ReviewDetail),
          },
          {
            path: "analytics",
            element: withSuspense(Analytics),
          },
          {
            path: "profile",
            element: withSuspense(Profile),
          },
          {
            path: "trainer",
            element: withSuspense(TrainerLibrary),
          },
          {
            path: "reading",
            element: withSuspense(Reading),
          },
          {
            path: "listening",
            element: withSuspense(Listening),
          },
          {
            path: "writing",
            element: withSuspense(Writing),
          },
          {
            path: "speaking",
            element: withSuspense(Speaking),
          },
          {
            path: "courses",
            element: withSuspense(StudentCourses),
          },
          {
            path: "admin/manage-users",
            element: (
              <AdminRoutes>
                {withSuspense(ManageUsers)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/manage-submissions",
            element: (
              <AdminRoutes>
                {withSuspense(ManageSubmissions)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/manage-questions",
            element: (
              <AdminRoutes>
                {withSuspense(ManageQuestions)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/manage-mock-tests",
            element: (
              <AdminRoutes>
                {withSuspense(ManageMockTests)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/manage-pricing",
            element: (
              <AdminRoutes>
                {withSuspense(ManagePricing)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/manage-resources",
            element: (
              <AdminRoutes>
                {withSuspense(ManageResources)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/manage-trainers",
            element: (
              <AdminRoutes>
                {withSuspense(ManageTrainers)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/create-mock-test",
            element: (
              <AdminRoutes>
                {withSuspense(CreateMockTest)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/edit-mock-test/:id",
            element: (
              <AdminRoutes>
                {withSuspense(CreateMockTest)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/add-questions",
            element: (
              <AdminRoutes>
                {withSuspense(AddQuestionForm)}
              </AdminRoutes>
            ),
          },
          {
            path: "admin/edit-questions/:id",
            element: (
              <AdminRoutes>
                {withSuspense(EditQuestionForm)}
              </AdminRoutes>
            ),
          },
          {
            path: "instructor/grade-submissions",
            element: (
              <InstructorRoutes>
                {withSuspense(GradeSubmissions)}
              </InstructorRoutes>
            ),
          },
          {
            path: "instructor/manage-resources",
            element: (
              <InstructorRoutes>
                {withSuspense(ManageResources)}
              </InstructorRoutes>
            ),
          },
          {
            path: "admin/settings",
            element: (
              <AdminRoutes>
                {withSuspense(AdminSettings)}
              </AdminRoutes>
            ),
          },
        ],
      },
      {
        path: "free-practice",
        element: <FreePracticeLayout />,
        children: [
          { index: true, element: withSuspense(GuestTestLibrary) },
          { path: "tests/:id", element: withSuspense(GuestTestEnvironment) },
        ],
      },
    ],
  },
]);

export default router;
