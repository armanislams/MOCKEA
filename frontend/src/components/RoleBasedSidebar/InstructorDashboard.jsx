import { NavLink } from "react-router";
import { PiChartBar, PiFiles, PiBookOpen, PiGraduationCap } from "react-icons/pi";

export const InstructorDashboard = ({ isDrawerOpen }) => {
  return (
    <>
      <li>
        <NavLink to="/dashboard" end title={!isDrawerOpen ? "Dashboard" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiChartBar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Dashboard</span>}
        </NavLink>
      </li>
      
      <li>
        <NavLink to="/dashboard/instructor/grade-submissions" title={!isDrawerOpen ? "Review Center" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiFiles className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Review Center</span>}
        </NavLink>
      </li>
      
      <li>
        <NavLink to="/dashboard/instructor/manage-resources" title={!isDrawerOpen ? "Manage Resources" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiBookOpen className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Resources</span>}
        </NavLink>
      </li>
      
      <li>
        <NavLink to="/dashboard/trainer" title={!isDrawerOpen ? "Trainers" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
          <PiGraduationCap className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Trainers</span>}
        </NavLink>
      </li>
      
     </>
  );
};
