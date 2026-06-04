import { NavLink } from "react-router";
import { PiChartBar, PiFiles, PiBookOpen, PiGraduationCap } from "react-icons/pi";

export const InstructorDashboard = ({ isDrawerOpen }) => {
  return (
    <>
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Dashboard">
        <NavLink to="/dashboard" end className={!isDrawerOpen ? "justify-center" : ""}>
          <PiChartBar className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Dashboard</span>}
        </NavLink>
      </li>
      
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Review Center">
        <NavLink to="/dashboard/instructor/grade-submissions" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiFiles className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Review Center</span>}
        </NavLink>
      </li>
      
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Manage Resources">
        <NavLink to="/dashboard/instructor/manage-resources" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiBookOpen className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Manage Resources</span>}
        </NavLink>
      </li>
      
      <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Trainers">
        <NavLink to="/dashboard/trainer" className={!isDrawerOpen ? "justify-center" : ""}>
          <PiGraduationCap className="w-5 h-5 shrink-0" />
          {isDrawerOpen && <span>Trainers</span>}
        </NavLink>
      </li>
      
     </>
  );
};
