import { NavLink } from "react-router";
import { PiChartBar, PiUsers, PiNotePencil, PiFiles } from "react-icons/pi";

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
                <NavLink to="/dashboard/my-students">
                    <PiUsers className="w-5 h-5" />
                    My Students
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/create-test">
                    <PiNotePencil className="w-5 h-5" />
                    Create Test
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard/admin/grade-submissions">
                    <PiFiles className="w-5 h-5" />
                    Review Center
                </NavLink>
            </li>
        </>
    );
};