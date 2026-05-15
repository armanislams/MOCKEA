import useAuth from "../../hooks/useAuth"
import Loader from "../../components/Loader/Loader"
import { useRole } from "../../hooks/useRole"
import Forbidden from "../../components/Common/Forbidden"

export const AdminRoutes = ({children})=>{
    const {user,loading} = useAuth()
    const {role}= useRole()
    if(loading){
        return <Loader/>
    }
    if(user && role === "admin"){
        return children;
    }
    return <Forbidden/>
}