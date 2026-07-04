import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import ScrollToTop from "../hooks/ScrollToTop";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";
import { useRole } from "../hooks/useRole";
import Loader from "../components/Loader/Loader";

export default function RootLayout() {
  const [notice, setNotice] = useState(null);
  const [maintenance, setMaintenance] = useState({ mode: false, message: "" });
  const [visible, setVisible] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { role, roleLoading } = useRole();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cleanBaseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const response = await axios.get(`${cleanBaseUrl}/settings/public`);
        
        if (response.data?.success) {
          setMaintenance({
            mode: response.data.maintenanceMode || false,
            message: response.data.maintenanceMessage || "",
          });
          if (response.data.systemNotice?.active) {
            setNotice(response.data.systemNotice);
          }
        }
      } catch (err) {
        console.error("Failed to fetch system config:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, [location.pathname]); // Re-fetch on navigation to ensure real-time maintenance checks

  useEffect(() => {
    if (configLoading || roleLoading) return;

    const isLoginPath = location.pathname.startsWith("/auth/login");
    const isMaintenancePath = location.pathname === "/maintenance";

    if (maintenance.mode) {
      // If maintenance mode is active, only allow superadmins to bypass
      if (role !== "superadmin" && !isMaintenancePath && !isLoginPath) {
        navigate("/maintenance", { replace: true });
      }
    } else {
      // If maintenance mode is disabled, redirect users away from the maintenance page
      if (isMaintenancePath) {
        navigate("/", { replace: true });
      }
    }
  }, [maintenance.mode, role, roleLoading, configLoading, location.pathname, navigate]);

  const getBannerColor = (type) => {
    switch (type) {
      case "error":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-amber-500 text-slate-900";
      case "info":
      default:
        return "bg-blue-600 text-white";
    }
  };

  if (configLoading || (maintenance.mode && roleLoading)) {
    return <Loader />;
  }

  return (
    <>
      <ScrollToTop />
      {notice && visible && (
        <div className={`w-full flex items-center justify-between px-6 py-3 transition-all duration-300 font-medium ${getBannerColor(notice.type)} text-xs md:text-sm shadow-md shrink-0`}>
          <div className="flex-1 text-center font-bold">
            📢 {notice.message}
          </div>
          <button
            onClick={() => setVisible(false)}
            className="btn btn-ghost btn-circle btn-xs border-none hover:bg-black/10 text-current ml-4 font-black"
          >
            ✕
          </button>
        </div>
      )}
      <Outlet context={{ maintenanceMessage: maintenance.message }} />
    </>
  );
}
