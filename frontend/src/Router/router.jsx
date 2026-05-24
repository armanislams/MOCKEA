import { createBrowserRouter } from "react-router";
import Home from "../components/Home/Home";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import HomeLayout from "../Layout/HomeLayout";
import Profile from "../components/Dashboard/Profile";
import Review from "../components/Dashboard/Student Dashboard/Review/Review";
import ReviewDetail from "../components/Dashboard/Student Dashboard/Review/ReviewDetail";
import Analytics from "../components/Dashboard/Student Dashboard/Analytics/Analytics";
import PrivateRoute from "../context/PrivateRoute";
import Loader from "../components/Loader/Loader";
import DashboardLayout from "../Layout/DashboardLayout";
import Practice from "../components/Dashboard/Student Dashboard/Practice/Practice";
import TakeTest from "../components/Dashboard/Student Dashboard/TakeTest/TakeTest";
import Reading from "../components/Dashboard/Student Dashboard/Reading/Reading";
import Listening from "../components/Dashboard/Student Dashboard/Listening/Listening";
import Writing from "../components/Dashboard/Student Dashboard/Writing/Writing";
import Speaking from "../components/Dashboard/Student Dashboard/Speaking/Speaking";
import DashboardIndex from "../components/Dashboard/DashboardIndex";
import ManageUsers from "../components/Dashboard/Admin Dashboard/ManageUsers";
import AdminSettings from "../components/Dashboard/Admin Dashboard/AdminSettings";
import FullMockTestLibrary from "../components/Dashboard/Student Dashboard/FullMockTest/FullMockTestLibrary";
import AddQuestionForm from "../components/Dashboard/Admin Dashboard/AddQuestionForm";
import ManageQuestions from "../components/Dashboard/Admin Dashboard/ManageQuestions";
import CreateMockTest from "../components/Dashboard/Admin Dashboard/CreateMockTest";
import ManageMockTests from "../components/Dashboard/Admin Dashboard/ManageMockTests";
import ManagePricing from "../components/Dashboard/Admin Dashboard/ManagePricing";
import ManageResources from "../components/Dashboard/Admin Dashboard/ManageResources";
import TestEnvironment from "../components/Dashboard/Student Dashboard/FullMockTest/TestEnvironment";
import Error from "../components/Common/Error";
import TrainerLibrary from "../components/Dashboard/Student Dashboard/TrainerLibrary";
import ManageTrainers from "../components/Dashboard/Admin Dashboard/ManageTrainers";
import GradeSubmissions from "../components/Dashboard/Instructor Dashboard/GradeSubmissions";
import { AdminRoutes } from "../context/Role Based Routes/AdminRoutes";
import { InstructorRoutes } from "../context/Role Based Routes/InstructorRoutes";
import GuestTestLibrary from "../components/Guest/GuestTestLibrary";
import FreePracticeLayout from "../Layout/FreePracticeLayout";
import GuestTestEnvironment from "../components/Guest/GuestTestEnvironment";
import AuthLayout from "../components/Auth/AuthLayout";
import PricingPage from "../components/PricingPage/PricingPage";
import FreeResourcesPage from "../components/FreeResources/FreeResourcesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    hydrateFallbackElement: <Loader />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/practice",
        element: (
          <PrivateRoute>
            <Practice />
          </PrivateRoute>
        ),
      },
      {
        path: "/pricing",
        element: <PricingPage />,
      },
      {
        path: "/free-resources",
        element: <FreeResourcesPage />,
      },
    ],
  },
  {
    path: '/auth',
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
    ]
  },
  {
    path: "/test/:id",
    element: (
      <PrivateRoute>
        <TestEnvironment />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardIndex />,
      },
      {
        path: "practice",
        element: <TakeTest />,
      },
      {
        path: "full-mock-test",
        element: <FullMockTestLibrary />,
      },
      {
        path: "review",
        element: <Review />,
      },
      {
        path: "review/:id",
        element: <ReviewDetail />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "trainer",
        element: <TrainerLibrary />,
      },
      {
        path: "reading",
        element: <Reading />,
      },
      {
        path: "listening",
        element: <Listening />,
      },
      {
        path: "writing",
        element: <Writing />,
      },
      {
        path: "speaking",
        element: <Speaking />,
      },
      {
        path: "admin/manage-users",
        element: (
          <AdminRoutes>
            <ManageUsers />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/manage-questions",
        element: (
          <AdminRoutes>
            <ManageQuestions />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/manage-mock-tests",
        element: (
          <AdminRoutes>
            <ManageMockTests />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/manage-pricing",
        element: (
          <AdminRoutes>
            <ManagePricing />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/manage-resources",
        element: (
          <AdminRoutes>
            <ManageResources />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/manage-trainers",
        element: (
          <AdminRoutes>
            <ManageTrainers />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/create-mock-test",
        element: (
          <AdminRoutes>
            <CreateMockTest />
          </AdminRoutes>
        ),
      },
      {
        path: "admin/add-questions",
        element: (
          <AdminRoutes>
            <AddQuestionForm />
          </AdminRoutes>
        ),
      },
      {
        path: "instructor/grade-submissions",
        element: (
          <InstructorRoutes>
            <GradeSubmissions />
          </InstructorRoutes>
        ),
      },
      {
        path: "instructor/manage-resources",
        element: (
          <InstructorRoutes>
            <ManageResources />
          </InstructorRoutes>
        ),
      },
      {
        path: "admin/settings",
        element: (
          <AdminRoutes>
            <AdminSettings />
          </AdminRoutes>
        ),
      },
    ],
  },
  {
    path: "free-practice",
    element: <FreePracticeLayout />, // public area
    children: [
      { index: true, element: <GuestTestLibrary /> },
      { path: "tests/:id", element: <GuestTestEnvironment /> }
    ]
  }
]);

export default router;
