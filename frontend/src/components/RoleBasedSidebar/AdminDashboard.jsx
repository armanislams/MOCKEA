import { NavLink } from "react-router";
import { PiChartBar, PiUsersThree, PiFiles, PiGear } from "react-icons/pi";

export const AdminDashboard = () => {
    return (
        <>
            <li>
                <NavLink to="/admin" end>
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
                <NavLink to="/dashboard/admin/add-tests">
                    <PiFiles className="w-5 h-5" />
                   Add Tests
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