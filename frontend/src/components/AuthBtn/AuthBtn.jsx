import { NavLink } from "react-router"
import useAuth from "../../hooks/useAuth"


const AuthBtn =()=>{
    const {user,logOut,loading} = useAuth()
    if(loading) return <span className="loading loading-spinner text-primary"></span>;
   return user ? (
     <label className="flex cursor-pointer gap-2 items-center">
       <button
         className="btn bg-primary hover:bg-primary-hover text-white border-none px-6 min-h-0 h-10 rounded-md font-bold"
         onClick={() => logOut()}
       >
         Log Out
       </button>
     </label>
   ) : (
     <div className="flex gap-5">
       <NavLink
         to={"/login"}
         className="btn hover:bg-primary-hover border-bc-navy border-2 px-6 min-h-0 h-10 rounded-full font-bold transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-md"
       >
         Log in
       </NavLink>
       <NavLink
         to={"/register"}
         className="btn bg-cta-btn hover:bg-primary-hover text-white border-none px-6 min-h-0 h-10 rounded-full font-bold transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-md"
       >
         Register
       </NavLink>
     </div>
   );
}

export default AuthBtn