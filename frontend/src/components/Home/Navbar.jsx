import { Link, NavLink } from "react-router";
import AuthBtn from "../AuthBtn/AuthBtn";

const Navbar = () => {
  const links = (
    <>
      <li>
        <NavLink className="hover:text-primary" to={"/"}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink className="hover:text-primary" to={"/about"}>
          About Us
        </NavLink>
      </li>
      <li>
        <NavLink className="hover:text-primary" to={"/dashboard"}>
          Dashboard
        </NavLink>
      </li>
    </>
  );
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 md:px-6 lg:px-8 border-b border-gray-200">
      <div className="navbar-start">
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
        <Link to={'/'} className="text-xl font-extrabold text-cta-btn tracking-tight flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-full  flex items-center justify-center">
            <img src="/mockea-logo.png" alt="mockea logo" />
          </div>
          <span className="hidden sm:inline">MOCKEA</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-bold text-gray-700">
          {links}
        </ul>
      </div>
      <div className="navbar-end">
        <AuthBtn />
      </div>
    </div>
  );
};

export default Navbar;
