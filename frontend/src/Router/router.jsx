import { createBrowserRouter } from "react-router";
import Home from "../components/Home/Home";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import HomeLayout from "../Layout/HomeLayout";
import Dashboard from "../components/Dashboard/Home/Dashboard";
import Profile from "../components/Dashboard/Profile";
import Review from "../components/Dashboard/Review/Review";
import Analytics from "../components/Dashboard/Analytics/Analytics";
import PrivateRoute from "../context/PrivateRoute";
import Loader from "../components/Loader/Loader";
import DashboardLayout from "../Layout/DashboardLayout";
import Practice from "../components/Dashboard/Practice/Practice";
import TakeTest from "../components/Dashboard/TakeTest/TakeTest";
import Reading from "../components/Dashboard/Reading/Reading";
import Listening from "../components/Dashboard/Listening/Listening";
import Writing from "../components/Dashboard/Writing/Writing";
import Speaking from "../components/Dashboard/Speaking/Speaking";

const router = createBrowserRouter([
    {
        path: '/',
        element:<HomeLayout/>,
        hydrateFallbackElement: <Loader/>,
        children:[
            {
                index: true,
                element: <Home/>
            },
            {
                path: "/login",
                element: <Login/>
            },
            {
                path: "/register",
                element: <Register/>
            },
            {
                path: '/practice',
                element: <PrivateRoute><Practice/></PrivateRoute>
            }
        ]
    },
    {
        path: '/dashboard',
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: 'practice',
                element: <TakeTest />
            },
            {
                path: 'review',
                element: <Review />
            },

            {
                path: 'analytics',
                element: <Analytics />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'reading',
                element: <Reading />
            },
            {
                path: 'listening',
                element: <Listening />
            },
            {
                path: 'writing',
                element: <Writing />
            },
            {
                path: 'speaking',
                element: <Speaking />
            }
        ]
    }
    
])

export default router