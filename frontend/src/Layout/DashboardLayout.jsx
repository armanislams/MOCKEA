import { Link, NavLink, Outlet } from 'react-router';
import AuthBtn from '../components/AuthBtn/AuthBtn';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M13 5v6h6' },
  { label: 'Take a Test', to: '/dashboard/practice', icon: 'M9 12l2 2 4-4' },
  { label: 'Review', to: '/dashboard/review', icon: 'M4 6h16M4 12h8m-8 6h16' },
  { label: 'Analytics', to: '/dashboard/analytics', icon: 'M3 3v18h18' },
  { label: 'Profile', to: '/dashboard/profile', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z' },
];

const DashboardLayout = () => {
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        
        {/* navbar */}
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
            <Link to="/" className="text-xl text-cta-btn font-bold font-semibold">
              MOCKEA
            </Link>
          </div>

          <div className="flex-none">
            <AuthBtn />
          </div>
        </div>

        {/* outlet */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* sidebar */}

      <div className="drawer-side z-20">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay" />
        <aside className="flex h-full w-72 flex-col bg-base-100 border-r border-base-300 p-4">
          <div className="rounded-3xl p-4 text-center shadow-sm">
            <div className="text-xl font-bold text-cta-btn">MOCKEA</div>
            <p className="text-sm text-base-content/70">IELTS mock test dashboard</p>
          </div>

          <ul className="menu mt-8 space-y-2 flex-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                      isActive ? 'bg-primary text-white' : 'text-base-content hover:bg-base-200'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
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
