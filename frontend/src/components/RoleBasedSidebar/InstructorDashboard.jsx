import { NavLink } from "react-router";
import { PiChartBar, PiFiles, PiUser, PiBookOpen } from "react-icons/pi";

export const InstructorDashboard = () => {
  return (
    <>
      <li>
        <NavLink to="/dashboard" end>
          <PiChartBar className="w-5 h-5" />
          Dashboard
        </NavLink>
      </li>
      
      <li>
        <NavLink to="/dashboard/instructor/grade-submissions">
          <PiFiles className="w-5 h-5" />
          Review Center
        </NavLink>
      </li>
      
      <li>
        <NavLink to="/dashboard/instructor/manage-resources">
          <PiBookOpen className="w-5 h-5" />
          Manage Resources
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
