import { NavLink, useLocation, useNavigate } from "react-router";
import { Logo } from "./Logo";
import AuthBtn from "../AuthBtn/AuthBtn";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPte = location.pathname.startsWith("/pte");

  const handleSelectMode = (mode) => {
    if (mode === "pte") {
      navigate("/pte");
    } else {
      navigate("/");
    }
  };

  const links = (
    <>
      <li>
        <NavLink className="hover:text-primary text-slate-700 font-bold" to={isPte ? "/pte" : "/"}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink className="hover:text-primary text-slate-700 font-bold" to="/about">
          About Us
        </NavLink>
      </li>
      <li>
        <NavLink className="hover:text-primary text-slate-700 font-bold" to="/pricing">
          Pricing
        </NavLink>
      </li>
      <li>
        <NavLink className="hover:text-primary text-slate-700 font-bold" to="/courses">
          Courses
        </NavLink>
      </li>
      <li>
        <NavLink className="hover:text-primary text-slate-700 font-bold" to="/free-resources">
          Free Resources
        </NavLink>
      </li>
    </>
  );
  return (
    <div className="navbar backdrop-blur-md bg-white/70 shadow-sm sticky top-0 z-50 md:px-6 lg:px-8 ">
      <div className="navbar-start flex items-center">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden pl-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52 font-bold text-gray-700"
          >
            {links}
          </ul>
        </div>
        <Logo />

        {/* Exam Type Selector Dropdown Toggle */}
        <div className="ml-3 dropdown dropdown-hover relative">
          <div tabIndex={0} role="button" className={`btn btn-xs rounded-xl font-black uppercase tracking-widest px-2.5 py-1.5 h-auto transition-all ${
            isPte 
              ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" 
              : "bg-red-50 border-red-200 text-cta-btn hover:bg-red-100"
          }`}>
            {isPte ? "PTE Prep" : "IELTS Prep"}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 ml-1 inline">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-white border border-slate-100 rounded-2xl w-40 z-50 text-xs font-bold mt-1">
            <li>
              <button onClick={() => handleSelectMode("ielts")} className={!isPte ? "text-cta-btn font-extrabold" : "text-slate-600 hover:text-cta-btn"}>
                IELTS Prep
              </button>
            </li>
            <li>
              <button onClick={() => handleSelectMode("pte")} className={isPte ? "text-blue-600 font-extrabold" : "text-slate-600 hover:text-blue-600"}>
                PTE Prep
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Desktop menu */}
      <div className="navbar-center bg-gray-100 rounded-full hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-bold text-gray-700">
          {links}
        </ul>
      </div>
      <div className="navbar-end">
        <AuthBtn/>
      </div>
    </div>
  );
};

export default Navbar;
