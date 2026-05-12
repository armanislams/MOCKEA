import { NavLink } from "react-router";
import AuthBtn from "../AuthBtn/AuthBtn";
import { Logo } from "./Logo";

const Navbar = () => {
  const links = (
    <>
      <li>
        <a  className="hover:text-primary" href="/#home">
          Home
        </a>
      </li>
      <li>
        <NavLink className="hover:text-primary" to={"/about"}>
          About Us
        </NavLink>
      </li>
      <li>
        <a className="hover:text-primary" href="/#pricing">
          Pricing
        </a>
      </li>
      <li>
        <a  className="hover:text-primary" href="/#freeResources">
          Free Resources
        </a>
      </li>
      <li>
        <NavLink className="hover:text-primary" to={"/dashboard"}>
          Dashboard
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
        <Logo/>
      </div>

      {/* Desktop menu */}
      <div className="navbar-center bg-gray-100 rounded-full hidden lg:flex">
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
