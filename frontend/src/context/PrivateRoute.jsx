import Loader from "../components/Loader/Loader";
import useAuth from "../hooks/useAuth"
import { Navigate } from "react-router";

const PrivateRoute=({children})=>{
const {user,loading}= useAuth()
if(loading) return <Loader/>
if (!user) {
        return <Navigate to={'/login'}></Navigate>
    }
    return children;
}

export default PrivateRoute