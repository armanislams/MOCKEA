import { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import ImpersonationTool from "./ImpersonationTool";
import { toast } from "react-toastify";
import {
  PiChartBar,
  PiShieldWarning,
  PiGear,
  PiUsersThree,
} from "react-icons/pi";

const SuperAdminConsole = () => {
  const [activeTab, setActiveTab] = useState("metrics");
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotalPages, setAuditLogsTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const axiosSecure = useAxiosSecure();

  const fetchMetricsAndConfig = async () => {
    try {
      setLoading(true);
      const [metricsRes, configRes] = await Promise.all([
        axiosSecure.get("/superadmin/metrics"),
        axiosSecure.get("/superadmin/config"),
      ]);
      setMetrics(metricsRes.data?.metrics || null);
      setConfig(configRes.data?.config || null);
    } catch (error) {
      console.error(error);
      toast.error("Error loading console diagnostics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (page = 1) => {
    try {
      const res = await axiosSecure.get(`/superadmin/logs?page=${page}&limit=10`);
      setAuditLogs(res.data?.logs || []);
      setAuditLogsTotalPages(res.data?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load administrative audit logs.");
    }
  };

  useEffect(() => {
    fetchMetricsAndConfig();
  }, []);

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs(auditLogsPage);
    }
  }, [activeTab, auditLogsPage]);

  const handleToggleMaintenance = async () => {
    if (!config) return;
    try {
      setUpdating(true);
      const res = await axiosSecure.put("/superadmin/config", {
        maintenanceMode: !config.maintenanceMode,
      });
      if (res.data?.success) {
        setConfig(res.data.config);
        toast.success(`Maintenance mode toggled to ${!config.maintenanceMode ? "ON" : "OFF"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update maintenance settings.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFlag = async (flagName) => {
    if (!config) return;
    const updatedFlags = {
      ...config.featureFlags,
      [flagName]: !config.featureFlags[flagName],
    };

    try {
      setUpdating(true);
      const res = await axiosSecure.put("/superadmin/config", {
        featureFlags: updatedFlags,
      });
      if (res.data?.success) {
        setConfig(res.data.config);
        toast.success(`Feature flag '${flagName}' toggled successfully.`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update feature flag.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    if (!config) return;
    const formData = new FormData(e.target);
    const active = formData.get("noticeActive") === "true";
    const message = formData.get("noticeMessage");
    const type = formData.get("noticeType");

    try {
      setUpdating(true);
      const res = await axiosSecure.put("/superadmin/config", {
        systemNotice: { active, message, type },
      });
      if (res.data?.success) {
        setConfig(res.data.config);
        toast.success("System announcement notice updated.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update announcement notice.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Super Admin Console
          </h1>
          <p className="text-sm text-slate-500">Sitewide global controls, health audits, and integration flags.</p>
        </div>

        {/* Global Maintenance Toggle */}
        <div className="flex items-center gap-3 bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Maintenance Mode</span>
          <input
            type="checkbox"
            className="toggle toggle-error"
            checked={config?.maintenanceMode || false}
            disabled={updating}
            onChange={handleToggleMaintenance}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-1 rounded-2xl border border-base-300 flex overflow-x-auto shrink-0">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`tab gap-2 rounded-xl transition-all duration-200 ${
            activeTab === "metrics" ? "tab-active bg-primary text-white" : ""
          }`}
        >
          <PiChartBar className="w-5 h-5" />
          Metrics & Health
        </button>
        <button
          onClick={() => setActiveTab("flags")}
          className={`tab gap-2 rounded-xl transition-all duration-200 ${
            activeTab === "flags" ? "tab-active bg-primary text-white" : ""
          }`}
        >
          <PiGear className="w-5 h-5" />
          Feature Flags
        </button>
        <button
          onClick={() => setActiveTab("impersonate")}
          className={`tab gap-2 rounded-xl transition-all duration-200 ${
            activeTab === "impersonate" ? "tab-active bg-primary text-white" : ""
          }`}
        >
          <PiUsersThree className="w-5 h-5" />
          Impersonation
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`tab gap-2 rounded-xl transition-all duration-200 ${
            activeTab === "audit" ? "tab-active bg-primary text-white" : ""
          }`}
        >
          <PiShieldWarning className="w-5 h-5" />
          Audit Trail Logs
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* Panel 1: Metrics */}
        {activeTab === "metrics" && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                <PiChartBar className="w-5 h-5 text-green-500" /> Database Health
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Status:</span>
                  <span className="font-bold text-green-600">{metrics.database?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Collections:</span>
                  <span className="font-bold">{metrics.database?.collectionsCount}</span>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                <PiGear className="w-5 h-5 text-blue-500" /> Server Performance
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Node CPU / Heap:</span>
                  <span className="font-bold text-blue-600">{metrics.server?.memory?.heapUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Uptime:</span>
                  <span className="font-bold">{Math.round(metrics.server?.uptime / 60)} mins</span>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                <PiChartBar className="w-5 h-5 text-orange-500" /> Site Metrics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Total Active Users:</span>
                  <span className="font-bold">{metrics.counts?.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Total Audit Logs:</span>
                  <span className="font-bold">{metrics.counts?.auditLogs}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel 2: Feature Flags */}
        {activeTab === "flags" && config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flags card */}
            <div className="card bg-base-100 border border-base-300 p-6 md:p-8 rounded-[2rem] shadow-sm">
              <h2 className="text-xl font-bold mb-4">Module Controls (Feature Flags)</h2>
              <p className="text-xs text-slate-400 mb-6">Toggling flags is instant and applies to all active sessions immediately.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <div>
                    <h4 className="font-bold text-sm">AI evaluation engine</h4>
                    <p className="text-xs text-slate-500">Grading of IELTS essays using OpenAI models.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={config.featureFlags?.aiGrading}
                    onChange={() => handleToggleFlag("aiGrading")}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <div>
                    <h4 className="font-bold text-sm">Anti-Cheat tab switch monitoring</h4>
                    <p className="text-xs text-slate-500">Submits test automatically when tab changes.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={config.featureFlags?.antiCheatTabSwitch}
                    onChange={() => handleToggleFlag("antiCheatTabSwitch")}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <div>
                    <h4 className="font-bold text-sm">IELTS Speaking Beta module</h4>
                    <p className="text-xs text-slate-500">Enable voice processing laboratories.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={config.featureFlags?.speakingPracticeBeta}
                    onChange={() => handleToggleFlag("speakingPracticeBeta")}
                    disabled={updating}
                  />
                </div>
              </div>
            </div>

            {/* Announcement Notices Form */}
            <div className="card bg-base-100 border border-base-300 p-6 md:p-8 rounded-[2rem] shadow-sm">
              <h2 className="text-xl font-bold mb-4">Broadcast System Notice</h2>
              
              <form onSubmit={handleUpdateNotice} className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Notice Status</span>
                  </label>
                  <select name="noticeActive" defaultValue={config.systemNotice?.active?.toString()} className="select select-bordered rounded-2xl w-full">
                    <option value="true">Active (Visible Sitewide)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Notice Style</span>
                  </label>
                  <select name="noticeType" defaultValue={config.systemNotice?.type || "info"} className="select select-bordered rounded-2xl w-full">
                    <option value="info">Information (Blue)</option>
                    <option value="warning">Warning (Orange)</option>
                    <option value="error">Critical (Red)</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Broadcast Message</span>
                  </label>
                  <textarea
                    name="noticeMessage"
                    defaultValue={config.systemNotice?.message || ""}
                    placeholder="Enter announcement text..."
                    className="textarea textarea-bordered rounded-2xl w-full h-24 focus:outline-none"
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={updating} className="btn btn-primary rounded-2xl w-full font-bold">
                  {updating ? "Saving Changes..." : "Publish Broadcast"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Panel 3: Impersonation */}
        {activeTab === "impersonate" && (
          <div className="max-w-xl mx-auto">
            <ImpersonationTool />
          </div>
        )}

        {/* Panel 4: Audit Trail */}
        {activeTab === "audit" && (
          <div className="card bg-base-100 border border-base-300 rounded-[2rem] overflow-hidden shadow-sm p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">Platform Audit Trail Log</h2>
            <div className="overflow-x-auto shrink-0 mb-4">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th>Admin / Actor</th>
                    <th>Action Event</th>
                    <th>Target Model</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">
                        No audit records found.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <div className="font-semibold text-sm">{log.actorEmail}</div>
                          <div className="text-xs badge badge-secondary">{log.actorRole}</div>
                        </td>
                        <td>
                          <span className="font-mono text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td>{log.targetType}</td>
                        <td className="text-xs text-slate-500 font-mono">{log.ipAddress}</td>
                        <td className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {auditLogsTotalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setAuditLogsPage((p) => Math.max(p - 1, 1))}
                  disabled={auditLogsPage === 1}
                  className="btn btn-sm btn-outline rounded-xl"
                >
                  Previous
                </button>
                <span className="self-center text-xs font-semibold px-4">
                  Page {auditLogsPage} of {auditLogsTotalPages}
                </span>
                <button
                  onClick={() => setAuditLogsPage((p) => Math.min(p + 1, auditLogsTotalPages))}
                  disabled={auditLogsPage === auditLogsTotalPages}
                  className="btn btn-sm btn-outline rounded-xl"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminConsole;
