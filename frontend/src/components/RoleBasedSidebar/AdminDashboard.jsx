import { NavLink } from "react-router";
import {
  PiChartBar,
  PiUsersThree,
  PiFiles,
  PiGear,
  PiBookOpen,
  PiCurrencyDollar,
  PiGraduationCap,
} from "react-icons/pi";

export const AdminDashboard = ({ isDrawerOpen }) => {
  return (
    <>
      <li>
        <NavLink to="/dashboard" end title={!isDrawerOpen ? "Dashboard Home" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiChartBar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Dashboard Home</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-users" title={!isDrawerOpen ? "Manage Users" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiUsersThree className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Users</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-questions" title={!isDrawerOpen ? "Manage Questions" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiBookOpen className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Questions</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-mock-tests" title={!isDrawerOpen ? "Manage Mock Tests" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiFiles className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Mock Tests</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-pricing" title={!isDrawerOpen ? "Manage Pricing" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiCurrencyDollar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Pricing</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-resources" title={!isDrawerOpen ? "Manage Resources" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiBookOpen className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Resources</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-trainers" title={!isDrawerOpen ? "Manage Trainers" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiGraduationCap className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Trainers</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/settings" title={!isDrawerOpen ? "Settings" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiGear className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Settings</span>}
        </NavLink>
      </li>
    </>
  );
};
