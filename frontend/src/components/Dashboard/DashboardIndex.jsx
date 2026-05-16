import { useRole } from '../../hooks/useRole';
import AdminDashboardHome from './Admin Dashboard/AdminDashboardHome';
import Loader from '../Loader/Loader';
import DashboardHome from './Student Dashboard/DashboardHome';
import { InstructorHome } from './Instructor Dashboard/InstructorHome';

const DashboardIndex = () => {
    const { role, roleLoading } = useRole();

    if (roleLoading) {
        return <Loader />;
    }

    if (role === 'admin') {
        return <AdminDashboardHome />;
    }

    if (role === 'instructor') {
        return <InstructorHome/>
    }

    // Default student dashboard home
    return <DashboardHome  />;
};

export default DashboardIndex;
