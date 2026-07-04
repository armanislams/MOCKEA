import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import ScrollToTop from "../hooks/ScrollToTop";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";
import { useRole } from "../hooks/useRole";
import Loader from "../components/Loader/Loader";
import { signInWithCustomToken } from "firebase/auth";
import auth from "../../firebase.config";
import { toast } from "react-toastify";

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

  const isImpersonating = sessionStorage.getItem("isImpersonating") === "true";
  const adminRestoreToken = sessionStorage.getItem("adminRestoreToken");

  const handleExitImpersonation = async () => {
    if (!adminRestoreToken) return;
    try {
      toast.info("Restoring Super Admin session...");
      await signInWithCustomToken(auth, adminRestoreToken);
      sessionStorage.removeItem("isImpersonating");
      sessionStorage.removeItem("impersonatorEmail");
      sessionStorage.removeItem("adminRestoreToken");
      toast.success("Super Admin session restored!");
      window.location.href = "/dashboard/superadmin/console";
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore Super Admin session. Please log in again.");
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

      {/* Floating Exit Impersonation Bar */}
      {isImpersonating && adminRestoreToken && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 border border-slate-700 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-xs font-semibold">Currently Impersonating User</span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="btn btn-primary btn-xs rounded-full px-3 py-1 font-bold text-xs uppercase hover:scale-105 transition-transform"
          >
            Exit Session
          </button>
        </div>
      )}
    </>
  );
}
