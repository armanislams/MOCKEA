import { NavLink } from "react-router";
import { PiChartBar, PiUsersThree, PiFiles, PiGear } from "react-icons/pi";

export const AdminDashboard = () => {
    return (
        <>
            <li>
                <NavLink to="/dashboard" end>
                    <PiChartBar className="w-5 h-5" />
                    Dashboard
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/manage-users">
                    <PiUsersThree className="w-5 h-5" />
                    Manage Users
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/add-tests">
                    <PiFiles className="w-5 h-5" />
                   Add Tests
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/settings">
                    <PiGear className="w-5 h-5" />
                    Settings
                </NavLink>
            </li>
        </>
    );
};