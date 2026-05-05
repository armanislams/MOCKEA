
const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 md:px-6 lg:px-8 border-b border-gray-200">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden pl-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-bold text-gray-700">
            <li><a>Home</a></li>
            <li><a>About Us</a></li>
            <li><a>Practice</a></li>
          </ul>
        </div>
        <a className="text-xl font-extrabold text-[#0028a1] tracking-tight flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#0028a1] flex items-center justify-center text-white text-xs">ES</div>
          <span className="hidden sm:inline">Eco Stream</span>
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-bold text-gray-700">
          <li><a className="hover:text-[#0028a1]">Home</a></li>
          <li><a className="hover:text-[#0028a1]">About Us</a></li>
          <li><a className="hover:text-[#0028a1]">Practice</a></li>
        </ul>
      </div>
      <div className="navbar-end">
        <a className="btn bg-[#0028a1] hover:bg-[#001f7a] text-white border-none px-6 min-h-0 h-10 rounded-md font-bold">Login</a>
      </div>
    </div>
  );
};

export default Navbar;
