import useAuth from "../../hooks/useAuth"
import Loader from "../../components/Loader/Loader"
import { useRole } from "../../hooks/useRole"
import Forbidden from "../../components/Common/Forbidden"

export const StudentRoutes = ({children})=>{
    const {user,loading} = useAuth()
    const {role, roleLoading, isError}= useRole()
    if(loading || roleLoading){
        return <Loader/>
    }
    if(isError) {
        return null;
    }
    if(user && role === "student"){
        return children;
    }
    return <Forbidden/>
}
