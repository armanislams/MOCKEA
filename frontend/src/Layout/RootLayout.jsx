import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import ScrollToTop from "../hooks/ScrollToTop";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";

export default function RootLayout() {
  const [notice, setNotice] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const cleanBaseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const response = await axios.get(`${cleanBaseUrl}/settings/public`);
        if (response.data?.success && response.data?.systemNotice?.active) {
          setNotice(response.data.systemNotice);
        }
      } catch (err) {
        console.error("Failed to fetch system announcement:", err);
      }
    };
    fetchNotice();
  }, []);

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
      <Outlet />
    </>
  );
}
