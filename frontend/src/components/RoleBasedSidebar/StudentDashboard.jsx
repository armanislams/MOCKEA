import { NavLink } from "react-router";
import { PiChartBar, PiPenNib, PiMagnifyingGlass, PiTrendUp, PiFiles, PiGraduationCap, PiNotebook } from "react-icons/pi";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const StudentDashboard = ({ isDrawerOpen }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const prefetchAnalytics = () => {
        queryClient.prefetchQuery({
            queryKey: ["analytics-summary"],
            queryFn: async () => {
                const res = await axiosSecure.get(`/analytics/summary`);
                return res.data.summary;
            },
            staleTime: 5 * 60 * 1000,
        });
    };

    const prefetchReview = () => {
        queryClient.prefetchQuery({
            queryKey: ["user-mock-results"],
            queryFn: async () => {
                const res = await axiosSecure.get("/mock-tests/results/user");
                return res.data.results ?? [];
            },
            staleTime: 5 * 60 * 1000,
        });
        queryClient.prefetchQuery({
            queryKey: ["user-lab-results"],
            queryFn: async () => {
                const res = await axiosSecure.get("/submissions/my-submissions");
                return res.data.submissions ?? [];
            },
            staleTime: 5 * 60 * 1000,
        });
    };

    const prefetchMockTests = () => {
        queryClient.prefetchQuery({
            queryKey: ["full-mock-tests"],
            queryFn: async () => {
                const res = await axiosSecure.get("/mock-tests");
                return {
                    tests: res.data.tests ?? [],
                    todayMockTestTaken: res.data.todayMockTestTaken ?? false
                };
            },
            staleTime: 5 * 60 * 1000,
        });
    };

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
                <NavLink 
                    to="/dashboard/full-mock-test" 
                    onMouseEnter={prefetchMockTests}
                    className={!isDrawerOpen ? "justify-center" : ""}
                >
                    <PiFiles className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Full Mock Test</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Review">
                <NavLink 
                    to="/dashboard/review" 
                    onMouseEnter={prefetchReview}
                    className={!isDrawerOpen ? "justify-center" : ""}
                >
                    <PiMagnifyingGlass className="w-5 h-5 shrink-0" />
                    {isDrawerOpen && <span>Review</span>}
                </NavLink>
            </li>
            <li className={!isDrawerOpen ? "tooltip tooltip-right z-50" : ""} data-tip="Analytics">
                <NavLink 
                    to="/dashboard/analytics" 
                    onMouseEnter={prefetchAnalytics}
                    className={!isDrawerOpen ? "justify-center" : ""}
                >
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
