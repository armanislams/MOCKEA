import useAuth from "../hooks/useAuth"
import { Navigate } from "react-router";

const PrivateRoute=({children})=>{
const {user}= useAuth()
if (!user) {
        return <Navigate to={'/login'}></Navigate>
    }
    return children;
}

export default PrivateRoute