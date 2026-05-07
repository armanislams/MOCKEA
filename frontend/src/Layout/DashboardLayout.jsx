import { Link, NavLink, Outlet } from 'react-router';
import AuthBtn from '../components/AuthBtn/AuthBtn';

const navItems = [
  { label: 'Dashboard Home', to: '/dashboard' },
  { label: 'Practice', to: '/dashboard/practice' },
  { label: 'Reading', to: '/dashboard/reading' },
  { label: 'Listening', to: '/dashboard/listening' },
  { label: 'Profile', to: '/dashboard/profile' },
];

const DashboardLayout = () => {
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-6">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="dashboard-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>

          <div className="flex-1">
            <Link to="/" className="text-lg font-semibold">
              EcoStream
            </Link>
          </div>

          <div className="flex-none">
            <AuthBtn/>
          </div>
        </div>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <div className="drawer-side z-20">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay" />
        <aside className="menu min-h-full w-72 bg-base-100 border-r border-base-300 p-4">
          <h2 className="px-2 pb-4 text-2xl text-center font-bold text-primary">Dashboard</h2>

          <ul className="space-y-2 mt-10">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={'hover:bg-primary text-white bg-secondary'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;
