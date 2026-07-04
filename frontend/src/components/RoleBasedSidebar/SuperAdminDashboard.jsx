import { NavLink } from "react-router";
import {
  PiShieldWarning,
  PiChartBar,
  PiUsersThree,
  PiCurrencyDollar,
  PiGear,
} from "react-icons/pi";

export const SuperAdminDashboard = ({ isDrawerOpen }) => {
  return (
    <>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Super Admin Console">
        <NavLink to="/dashboard/superadmin/console" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiShieldWarning className="w-5 h-5 shrink-0 text-red-500 font-bold" />
          {isDrawerOpen && <span className="font-extrabold text-red-600 dark:text-red-400">Super Admin Console</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Dashboard Home">
        <NavLink to="/dashboard" end className={!isDrawerOpen ? "justify-center" : ""}>
          <PiChartBar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Dashboard Home</span>}
        </NavLink>
      </li>
      <div className="divider my-1 text-xs opacity-50">System Management</div>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Users">
        <NavLink to="/dashboard/admin/manage-users" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiUsersThree className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Users</span>}
        </NavLink>
      </li>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Pricing">
        <NavLink to="/dashboard/admin/manage-pricing" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiCurrencyDollar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Pricing</span>}
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
