import { NavLink } from "react-router";
import useAuth from "../../hooks/useAuth";
import Dropdown from "../Home/Navbar/Dropdown";

const AuthBtn = () => {
  const { user, loading} = useAuth();

  if (loading)
    return <span className="loading loading-spinner text-primary"></span>;
  return user ?
    <Dropdown/>
    :
     (
    <div className="flex gap-1 sm:gap-5">
      <NavLink
        to={"/auth/login"}
        className="btn hover:bg-primary-hover hover:text-white border-bc-navy border-2 sm:px-6 min-h-0 sm:h-10 rounded-lg font-bold transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-md"
      >
        Log in
      </NavLink>
      <NavLink
        to={"/free-practice"}
        className="btn bg-cta-btn hover:bg-primary-hover text-white border-none sm:px-6 min-h-0 sm:h-10 rounded-lg font-bold transition duration-200 ease-out transform hover:-translate-y-0.5 hover:shadow-md"
      >
        Try For Free...
      </NavLink>
    </div>
  );
};

export default AuthBtn;
