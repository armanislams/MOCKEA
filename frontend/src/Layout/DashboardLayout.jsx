import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { PiHouse, PiSignOut, PiUser } from "react-icons/pi";
import useAuth from "../hooks/useAuth";
import { useRole } from "../hooks/useRole";
import { AdminDashboard } from "../components/RoleBasedSidebar/AdminDashboard";
import { InstructorDashboard } from "../components/RoleBasedSidebar/InstructorDashboard";
import StudentDashboard from "../components/RoleBasedSidebar/StudentDashboard";
import Loader from "../components/Loader/Loader";
import { Logo } from "../components/Home/Logo";
import useFullscreen from "../hooks/useFullscreen";

const DashboardLayout = () => {
  const { user, logOut } = useAuth();
  const { role, roleLoading, isError } = useRole();
  const navigate = useNavigate();
  const { isFullscreen } = useFullscreen();

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
        return <AdminDashboard />;
      case "instructor":
        return <InstructorDashboard />;
      case "student":
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className={`drawer ${isFullscreen ? "" : "lg:drawer-open"}`}>
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-start bg-base-200">
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
        <div className="drawer-side z-50">
          <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content border-r border-base-200">
            {/* Sidebar content here */}
            <div className="mb-8 px-4">
             <Logo/>
              <p className="text-xs text-base-content/50 mt-1">IELTS mock test dashboard</p>
            </div>

            <div className="flex items-center gap-3 px-4 mb-6">
              <div className="avatar placeholder">
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
              <div className="overflow-hidden">
                <h3 className="font-bold truncate">{user?.displayName || user?.email?.split('@')[0] || "User"}</h3>
                <p className="text-xs capitalize text-base-content/60">{role || "student"}</p>
              </div>
            </div>

            {renderSidebarLinks()}

            <div className="divider my-4"></div>

            <li>
              <NavLink to="/">
                <PiHouse className="w-5 h-5" />
                Home
              </NavLink>
            </li>
             <li>
          <NavLink to="/dashboard/profile">
            <PiUser className="w-5 h-5" />
            My Profile
          </NavLink>
        </li>
            <li>
              <button onClick={handleLogOut}>
                <PiSignOut className="w-5 h-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

