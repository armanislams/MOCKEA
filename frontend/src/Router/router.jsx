import { createBrowserRouter } from "react-router";
import Home from "../components/Home/Home";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import HomeLayout from "../Layout/HomeLayout";
import Practice from "../components/Practice/Practice";
import Dashboard from "../components/Dashboard/Dashboard";
import Profile from "../components/Dashboard/Profile";
import PrivateRoute from "../context/PrivateRoute";
import Loader from "../components/Loader/Loader";
import DashboardLayout from "../Layout/DashboardLayout";

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
                element: <Practice />
            },
            {
                path: 'profile',
                element: <Profile />
            }
        ]
    }
    
])

export default router