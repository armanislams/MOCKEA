import { NavLink } from "react-router";
import { PiChartBar, PiPenNib, PiMagnifyingGlass, PiTrendUp, PiFiles, PiGraduationCap, PiNotebook } from "react-icons/pi";

const StudentDashboard = ({ isDrawerOpen }) => {
    return (
        <>
            <li>
                <NavLink to="/dashboard" end title={!isDrawerOpen ? "Dashboard" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiChartBar className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Dashboard</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/practice" title={!isDrawerOpen ? "Take a Test" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiPenNib className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Take a Test</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/full-mock-test" title={!isDrawerOpen ? "Full Mock Test" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiFiles className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Full Mock Test</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/review" title={!isDrawerOpen ? "Review" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiMagnifyingGlass className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Review</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/analytics" title={!isDrawerOpen ? "Analytics" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiTrendUp className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Analytics</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/trainer" title={!isDrawerOpen ? "Trainers" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiGraduationCap className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Trainers</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/courses" title={!isDrawerOpen ? "Courses" : ""} className={!isDrawerOpen ? "justify-center" : ""}>
                    <PiNotebook className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Courses</span>}
                </NavLink>
            </li>
        </>
    );
};

export default StudentDashboard;
