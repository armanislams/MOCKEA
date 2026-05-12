import { NavLink } from "react-router"
import useAuth from "../../hooks/useAuth"


const AuthBtn =()=>{
    const {user,logOut,loading} = useAuth()
    if(loading) return <span className="loading loading-spinner text-primary"></span>;
   return user ? (
     <label className="flex cursor-pointer items-center gap-2">
       <button
         className="btn h-10 min-h-0 min-w-0 rounded-md border-none bg-primary px-2 text-[11px] font-bold text-white hover:bg-primary-hover sm:px-6 sm:text-sm"
         onClick={() => logOut()}
       >
         Log Out
       </button>
     </label>
   ) : (
     <div className="flex gap-1 sm:gap-5">
       <NavLink
         to={"/login"}
         className="btn hover:bg-primary-hover hover:text-white border-bc-navy border-2 sm:px-6 min-h-0 sm:h-10 rounded-full font-bold transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-md"
       >
         Log in
       </NavLink>
       <NavLink
         to={"/register"}
         className="btn bg-cta-btn hover:bg-primary-hover text-white border-none sm:px-6 min-h-0 sm:h-10 rounded-full font-bold transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-md"
       >
        Try For Free...
       </NavLink>
     </div>
   );
}

export default AuthBtn