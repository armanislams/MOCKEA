import { useRole } from '../../hooks/useRole';
import AdminDashboardHome from './Admin Dashboard/AdminDashboardHome';
import Loader from '../Loader/Loader';
import DashboardHome from './Student Dashboard/DashboardHome';

const DashboardIndex = () => {
    const { role, roleLoading } = useRole();

    if (roleLoading) {
        return <Loader />;
    }

    if (role === 'admin') {
        return <AdminDashboardHome />;
    }

    if (role === 'instructor') {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <h1 className="text-3xl font-bold mb-4">Instructor Dashboard</h1>
                <p className="text-base-content/70">Welcome to your instructor dashboard. Your active classes and student reports will appear here.</p>
            </div>
        );
    }

    // Default student dashboard home
    return <DashboardHome  />;
};

export default DashboardIndex;
