import { NavLink } from "react-router";
import { PiChartBar, PiUsersThree, PiFiles, PiGear, PiBookOpen } from "react-icons/pi";

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
                <NavLink to="/dashboard/admin/settings">
                    <PiGear className="w-5 h-5" />
                    Settings
                </NavLink>
            </li>
        </>
    );
};