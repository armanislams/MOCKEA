import { createBrowserRouter } from "react-router";
import Home from "../components/Home/Home";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import HomeLayout from "../Layout/HomeLayout";
import Practice from "../components/Practice/Practice";

const router = createBrowserRouter([
    {
        path: '/',
        element:<HomeLayout/>,
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
                element: <Practice/>
            }
        ]
    },
    
])

export default router