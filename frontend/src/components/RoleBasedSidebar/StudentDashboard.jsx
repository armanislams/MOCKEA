import { NavLink } from "react-router";
import { PiChartBar, PiPenNib, PiMagnifyingGlass, PiTrendUp, PiUser, PiFiles } from "react-icons/pi";

const StudentDashboard = () => {
    return (
        <>
            <li>
                <NavLink to="/dashboard" end>
                    <PiChartBar className="w-5 h-5" />
                    Dashboard
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/practice">
                    <PiPenNib className="w-5 h-5" />
                    Take a Test
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/full-mock-test">
                    <PiFiles className="w-5 h-5" />
                    Full Mock Test
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/review">
                    <PiMagnifyingGlass className="w-5 h-5" />
                    Review
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/analytics">
                    <PiTrendUp className="w-5 h-5" />
                    Analytics
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/profile">
                    <PiUser className="w-5 h-5" />
                    Profile
                </NavLink>
            </li>
        </>
    );
};

export default StudentDashboard;
