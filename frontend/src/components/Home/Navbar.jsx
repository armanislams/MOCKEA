import { NavLink } from "react-router";
import { Logo } from "./Logo";
import AuthBtn from "../AuthBtn/AuthBtn";

const Navbar = () => {
  const links = (
    <>
      <li>
        <NavLink className="hover:text-primary text-slate-700 font-bold" to="/">
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
        <NavLink className="hover:text-primary text-slate-700 font-bold" to="/free-resources">
          Free Resources
        </NavLink>
      </li>
    </>
  );
  return (
    <div className="navbar backdrop-blur-md bg-white/70 shadow-sm sticky top-0 z-50 md:px-6 lg:px-8 ">
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
        <Logo />
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
