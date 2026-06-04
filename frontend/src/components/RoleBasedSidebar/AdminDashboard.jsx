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
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Dashboard Home">
        <NavLink to="/dashboard" end className={!isDrawerOpen ? "justify-center" : ""}>
          <PiChartBar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Dashboard Home</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Users">
        <NavLink to="/dashboard/admin/manage-users" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiUsersThree className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Users</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Questions">
        <NavLink to="/dashboard/admin/manage-questions" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiBookOpen className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Questions</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Mock Tests">
        <NavLink to="/dashboard/admin/manage-mock-tests" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiFiles className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Mock Tests</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Pricing">
        <NavLink to="/dashboard/admin/manage-pricing" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiCurrencyDollar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Pricing</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Resources">
        <NavLink to="/dashboard/admin/manage-resources" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiBookOpen className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Resources</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Trainers">
        <NavLink to="/dashboard/admin/manage-trainers" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiGraduationCap className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Trainers</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Settings">
        <NavLink to="/dashboard/admin/settings" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiGear className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Settings</span>}
        </NavLink>
      </li>
    </>
  );
};
