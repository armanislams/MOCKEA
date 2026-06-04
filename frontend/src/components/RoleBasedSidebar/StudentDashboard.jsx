import { NavLink } from "react-router";
import { PiChartBar, PiPenNib, PiMagnifyingGlass, PiTrendUp, PiFiles, PiGraduationCap, PiNotebook } from "react-icons/pi";

const StudentDashboard = ({ isDrawerOpen }) => {
    return (
        <>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Dashboard">
                <NavLink to="/dashboard" end className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiChartBar className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Dashboard</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Take a Test">
                <NavLink to="/dashboard/practice" className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiPenNib className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Take a Test</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Full Mock Test">
                <NavLink to="/dashboard/full-mock-test" className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiFiles className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Full Mock Test</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Review">
                <NavLink to="/dashboard/review" className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiMagnifyingGlass className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Review</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Analytics">
                <NavLink to="/dashboard/analytics" className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiTrendUp className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Analytics</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Trainers">
                <NavLink to="/dashboard/trainer" className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiGraduationCap className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Trainers</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Courses">
                <NavLink to="/dashboard/courses" className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiNotebook className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Courses</span>}
                </NavLink>
            </li>
        </>
    );
};

export default StudentDashboard;
