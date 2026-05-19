import { useRole } from '../../hooks/useRole';
import AdminDashboardHome from './Admin Dashboard/AdminDashboardHome';
import Loader from '../Loader/Loader';
import DashboardHome from './Student Dashboard/DashboardHome';
import { InstructorHome } from './Instructor Dashboard/InstructorHome';

const DashboardIndex = () => {
    const { role, roleLoading, isError } = useRole();

    if (roleLoading) {
        return <Loader />;
    }

    if (isError) {
        return null;
    }

    if (role === 'admin') {
        return <AdminDashboardHome />;
    }

    if (role === 'instructor') {
        return <InstructorHome/>
    }

    // Default student dashboard home
    if(role === 'student') return <DashboardHome  />;

    return <div className='h-screen flex items-center justify-center'>
        <p className='text-2xl font-bold mt-10 text-error'>Please Log In or Register to continue</p>
    </div>
};

export default DashboardIndex;
