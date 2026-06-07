import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { PiHouse, PiSignOut, PiUser, PiCaretLeft, PiCaretRight } from "react-icons/pi";
import useAuth from "../hooks/useAuth";
import { useRole } from "../hooks/useRole";
import { AdminDashboard } from "../components/RoleBasedSidebar/AdminDashboard";
import { InstructorDashboard } from "../components/RoleBasedSidebar/InstructorDashboard";
import StudentDashboard from "../components/RoleBasedSidebar/StudentDashboard";
import Loader from "../components/Loader/Loader";
import { Logo } from "../components/Home/Logo";
import useFullscreen from "../hooks/useFullscreen";
import StudyBuddyChatbot from "../components/Common/StudyBuddyChatbot";

const DashboardLayout = () => {
  const { user, logOut } = useAuth();
  const { role, roleLoading, isError } = useRole();
  const navigate = useNavigate();
  const { isFullscreen } = useFullscreen();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    if (isError) {
      logOut()
        .then(() => {
          navigate("/auth/login");
        })
        .catch((err) => console.error(err));
    }
  }, [isError, logOut, navigate]);

  if (roleLoading) {
    return <Loader />;
  }

  if (isError) {
    return null;
  }

  const handleLogOut = () => {
    logOut()
      .then(() => {
        navigate('/');
      })
      .catch((err) => console.error(err));
  };

  const renderSidebarLinks = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard isDrawerOpen={isDrawerOpen} />;
      case "instructor":
        return <InstructorDashboard isDrawerOpen={isDrawerOpen} />;
      case "student":
      default:
        return <StudentDashboard isDrawerOpen={isDrawerOpen} />;
    }
  };

  return (
    <div className={`drawer h-screen overflow-hidden ${isFullscreen ? "" : "lg:drawer-open"}`}>
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" checked={isDrawerOpen} onChange={(e) => setIsDrawerOpen(e.target.checked)} />
      <div className="drawer-content flex flex-col h-full overflow-hidden bg-base-200">
        {/* Page content here */}
        {/* <div className="w-full navbar bg-base-100 lg:hidden shadow-sm">
          <div className="flex-none">
            <label
              htmlFor="dashboard-drawer"
              className="btn btn-square btn-ghost drawer-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <Logo/>
        </div> */}

        <div className={`w-full flex-1 overflow-y-auto ${isFullscreen ? "p-0" : "p-4 md:p-8"}`}>
          <Outlet />
        </div>
      </div>

      {!isFullscreen && (
        <div className={`drawer-side z-50 transition-all duration-300 ${isDrawerOpen ? "" : "lg:w-20 lg:overflow-visible"}`}>
          <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
          <ul className={`menu p-4 min-h-full bg-base-100 text-base-content border-r border-base-200 transition-all duration-300 overflow-y-auto ${
            isDrawerOpen ? "w-80" : "w-80 lg:w-20 lg:overflow-visible"
          }`}>
            {/* Sidebar content here */}
            {isDrawerOpen ? (
              <div className="flex items-center justify-between mb-8 px-4">
                <div>
                  <Logo />
                  <p className="text-xs text-base-content/50 mt-1">IELTS mock test dashboard</p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle hidden lg:flex text-base-content/60 hover:text-primary transition-colors shrink-0"
                  title="Collapse Sidebar"
                >
                  <PiCaretLeft className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 mb-8">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="btn btn-ghost btn-sm btn-circle hidden lg:flex text-base-content/60 hover:text-primary transition-colors"
                  title="Expand Sidebar"
                >
                  <PiCaretRight className="text-xl" />
                </button>
              </div>
            )}

            <div className={`flex items-center mb-6 transition-all duration-300 ${isDrawerOpen ? "gap-3 px-4" : "justify-center"}`}>
              <div className="avatar placeholder shrink-0">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} />
                  ) : (
                    <span className="text-xl">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
              </div>
              {isDrawerOpen && (
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate">{user?.displayName || user?.email?.split('@')[0] || "User"}</h3>
                  <p className="text-xs capitalize text-base-content/60">{role || "student"}</p>
                </div>
              )}
            </div>

            {renderSidebarLinks()}

            <div className="divider my-4"></div>

            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Home">
              <NavLink to="/" className={!isDrawerOpen ? "justify-center" : ""}>
                <PiHouse className="w-5 h-5 shrink-0" />
                {isDrawerOpen && <span>Home</span>}
              </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="My Profile">
              <NavLink to="/dashboard/profile" className={!isDrawerOpen ? "justify-center" : ""}>
                <PiUser className="w-5 h-5 shrink-0" />
                {isDrawerOpen && <span>My Profile</span>}
              </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Logout">
              <button onClick={handleLogOut} className={`w-full flex items-center ${!isDrawerOpen ? "justify-center" : ""}`}>
                <PiSignOut className="w-5 h-5 shrink-0" />
                {isDrawerOpen && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      )}
      <StudyBuddyChatbot />
    </div>
  );
};

export default DashboardLayout;

