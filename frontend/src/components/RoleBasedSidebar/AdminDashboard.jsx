import { NavLink } from "react-router";
import {
  PiChartBar,
  PiUsersThree,
  PiFiles,
  PiGear,
  PiBookOpen,
  PiUser,
} from "react-icons/pi";

export const AdminDashboard = () => {
  return (
    <>
      <li>
        <NavLink to="/dashboard">
          <PiChartBar className="w-5 h-5" />
          Dashboard Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-users">
          <PiUsersThree className="w-5 h-5" />
          Manage Users
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-questions">
          <PiBookOpen className="w-5 h-5" />
          Manage Questions
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/manage-mock-tests">
          <PiFiles className="w-5 h-5" />
          Manage Mock Tests
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/instructor/grade-submissions">
          <PiBookOpen className="w-5 h-5" />
          Review Center
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/settings">
          <PiGear className="w-5 h-5" />
          Settings
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/profile">
          <PiUser className="w-5 h-5" />
          My Profile
        </NavLink>
      </li>
    </>
  );
};
