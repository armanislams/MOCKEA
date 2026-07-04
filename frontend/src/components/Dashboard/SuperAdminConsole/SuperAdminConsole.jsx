import { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import ImpersonationTool from "./ImpersonationTool";
import { toast } from "react-toastify";
import { alerts } from "../../../utils/alerts";
import {
  PiChartBar,
  PiShieldWarning,
  PiGear,
  PiUsersThree,
  PiBug,
  PiTrash,
  PiCaretDown,
  PiCaretUp,
  PiCopy,
  PiDatabase,
  PiEnvelopeSimple,
  PiDownloadSimple,
  PiPlay,
  PiEye,
  PiNotebook,
  PiQuestion,
  PiFileText,
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

  // Error analytics states
  const [errorClusters, setErrorClusters] = useState([]);
  const [errorSortBy, setErrorSortBy] = useState("count"); // 'count' | 'countLastHour' | 'countLast24Hours'
  const [expandedErrorSig, setExpandedErrorSig] = useState(null);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [clearingErrors, setClearingErrors] = useState(false);

  // Email broadcast tab states
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [emailCohort, setEmailCohort] = useState("all");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

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

  const fetchErrorAnalytics = async () => {
    try {
      setLoadingErrors(true);
      const res = await axiosSecure.get("/superadmin/error-analytics");
      setErrorClusters(res.data?.errorClusters || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load backend error aggregation diagnostics.");
    } finally {
      setLoadingErrors(false);
    }
  };

  const handleClearErrorLogs = async () => {
    const result = await alerts.confirmAction({
      title: "Are you sure?",
      text: "Are you sure you want to permanently clear all backend error logs? This cannot be undone.",
      confirmText: "Yes, flush them!",
      danger: true,
    });
    if (!result.isConfirmed) return;

    try {
      setClearingErrors(true);
      await axiosSecure.delete("/settings/logs");
      toast.success("All backend error logs have been flushed.");
      setErrorClusters([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear backend error logs.");
    } finally {
      setClearingErrors(false);
    }
  };

  useEffect(() => {
    if (activeTab === "errors") {
      fetchErrorAnalytics();
    }
  }, [activeTab]);



  const fetchBroadcastHistory = async () => {
    try {
      setLoadingBroadcasts(true);
      const res = await axiosSecure.get("/superadmin/broadcasts");
      setBroadcasts(res.data?.broadcasts || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch past email broadcasts.");
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailContent.trim()) {
      return toast.warning("Subject and content are required.");
    }

    const result = await alerts.confirmAction({
      title: "Confirm Email Broadcast?",
      text: `Send announcement email broadcast to the '${emailCohort.toUpperCase()}' cohort?`,
      confirmText: "Yes, broadcast!",
    });
    if (!result.isConfirmed) return;

    try {
      setSendingBroadcast(true);
      const res = await axiosSecure.post("/superadmin/broadcast", {
        subject: emailSubject,
        content: emailContent,
        cohort: emailCohort,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Email broadcast sent successfully!");
        setEmailSubject("");
        setEmailContent("");
        fetchBroadcastHistory();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email broadcast.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  useEffect(() => {
    if (activeTab === "email") {
      fetchBroadcastHistory();
    }
  }, [activeTab]);

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
        <button
          onClick={() => setActiveTab("errors")}
          className={`tab gap-2 rounded-xl transition-all duration-200 ${
            activeTab === "errors" ? "tab-active bg-primary text-white" : ""
          }`}
        >
          <PiBug className="w-5 h-5" />
          System Errors
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`tab gap-2 rounded-xl transition-all duration-200 ${
            activeTab === "email" ? "tab-active bg-primary text-white" : ""
          }`}
        >
          <PiEnvelopeSimple className="w-5 h-5" />
          Email Broadcast
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

        {/* Panel 5: System Error Aggregation */}
        {activeTab === "errors" && (
          <div className="card bg-base-100 border border-base-300 rounded-[2rem] shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-base-200 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PiBug className="text-red-500 w-6 h-6" /> Detailed Backend Error Aggregation
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Clusters backend error stack traces automatically, calculated from the latest 5,000 occurrences.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort control */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Sort by:</span>
                  <select
                    value={errorSortBy}
                    onChange={(e) => setErrorSortBy(e.target.value)}
                    className="select select-sm select-bordered rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="count">Total Count</option>
                    <option value="countLastHour">Last 1 Hour</option>
                    <option value="countLast24Hours">Last 24 Hours</option>
                  </select>
                </div>

                {/* Action buttons */}
                <button
                  onClick={fetchErrorAnalytics}
                  disabled={loadingErrors}
                  className="btn btn-sm btn-outline rounded-xl font-semibold"
                >
                  {loadingErrors ? "Loading..." : "Refresh"}
                </button>

                <button
                  onClick={handleClearErrorLogs}
                  disabled={clearingErrors}
                  className="btn btn-sm btn-error btn-outline rounded-xl font-semibold gap-1"
                >
                  <PiTrash className="w-4 h-4" />
                  Flush Error Logs
                </button>
              </div>
            </div>

            {loadingErrors ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : errorClusters.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <PiBug className="w-12 h-12 mx-auto mb-3 opacity-30" />
                No aggregated backend error logs found.
              </div>
            ) : (
              <div className="space-y-4">
                {[...errorClusters]
                  .sort((a, b) => b[errorSortBy] - a[errorSortBy])
                  .map((cluster) => {
                    const isExpanded = expandedErrorSig === cluster.signature;
                    return (
                      <div
                        key={cluster.signature}
                        className="border border-base-200 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        {/* Summary Header Row */}
                        <div
                          onClick={() => setExpandedErrorSig(isExpanded ? null : cluster.signature)}
                          className="bg-base-50/50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Representative Status code badges */}
                              {Object.keys(cluster.statuses).map((status) => (
                                <span
                                  key={status}
                                  className={`badge badge-sm font-mono font-bold ${
                                    status.startsWith("5")
                                      ? "badge-error text-white"
                                      : "badge-warning"
                                  }`}
                                >
                                  {status}
                                </span>
                              ))}
                              {/* Paths / routes */}
                              <span className="font-semibold font-mono text-xs text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
                                {Object.keys(cluster.paths)[0] || "Client / Background"}
                              </span>
                              {Object.keys(cluster.paths).length > 1 && (
                                <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-1 rounded">
                                  +{Object.keys(cluster.paths).length - 1} more routes
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                              {cluster.message}
                            </h3>
                          </div>

                          {/* Stats Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-center">
                              <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                              <span className="badge badge-neutral font-mono font-semibold">{cluster.count}</span>
                            </div>
                            {cluster.countLast24Hours > 0 && (
                              <div className="text-center">
                                <span className="block text-[10px] uppercase font-bold text-orange-400">24h</span>
                                <span className="badge badge-warning font-mono font-semibold text-white">{cluster.countLast24Hours}</span>
                              </div>
                            )}
                            {cluster.countLastHour > 0 && (
                              <div className="text-center">
                                <span className="block text-[10px] uppercase font-bold text-red-500">1h</span>
                                <span className="badge badge-error font-mono font-semibold text-white">{cluster.countLastHour}</span>
                              </div>
                            )}
                            <div className="pl-2">
                              {isExpanded ? <PiCaretUp className="w-5 h-5" /> : <PiCaretDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Details Body */}
                        {isExpanded && (
                          <div className="p-4 border-t border-base-200 bg-base-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Metadata breakdown */}
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-400 uppercase text-[10px]">Impact & Timing</h4>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-base-50 p-2 rounded-xl border border-base-200">
                                      <span className="text-[10px] text-slate-500 block">First Seen</span>
                                      <span className="font-medium">{new Date(cluster.firstSeen).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-base-50 p-2 rounded-xl border border-base-200">
                                      <span className="text-[10px] text-slate-500 block">Last Seen</span>
                                      <span className="font-medium">{new Date(cluster.lastSeen).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-base-50 p-2 rounded-xl border border-base-200 col-span-2">
                                      <span className="text-[10px] text-slate-500 block">Affected Users ({cluster.uniqueUsersCount} total)</span>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {cluster.users.length === 0 ? (
                                          <span className="text-slate-400 font-medium italic">Anonymous / Client logs</span>
                                        ) : (
                                          cluster.users.map((email) => (
                                            <span key={email} className="badge badge-ghost font-mono text-[10px]">{email}</span>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-400 uppercase text-[10px]">Affected API Endpoints</h4>
                                  <div className="mt-1 space-y-1 max-h-32 overflow-y-auto pr-1">
                                    {Object.entries(cluster.paths).map(([path, cnt]) => (
                                      <div key={path} className="flex justify-between bg-base-50 px-2.5 py-1.5 rounded-lg border border-base-200 font-mono text-[11px]">
                                        <span className="text-slate-700 dark:text-slate-300 truncate">{path}</span>
                                        <span className="font-bold text-slate-500">{cnt}x</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Stack Trace display */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-400 uppercase text-[10px]">Stack Trace & Signature</h4>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(cluster.stack || cluster.signature);
                                    toast.success("Stack trace copied to clipboard.");
                                  }}
                                  className="btn btn-xs btn-outline rounded-lg flex items-center gap-1 font-semibold text-[10px] py-1 px-2"
                                >
                                  <PiCopy className="w-3 h-3" />
                                  Copy Trace
                                </button>
                              </div>
                              <pre className="mockup-code bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto select-text max-h-[300px] border border-slate-800">
                                <code>{cluster.stack || cluster.signature}</code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}


        {/* Panel 7: Email Broadcast */}
        {activeTab === "email" && (
          <div className="card bg-base-100 border border-base-300 rounded-[2rem] shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PiEnvelopeSimple className="text-primary w-6 h-6" /> Interactive Email Broadcast
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Compose styled system updates and promotional emails, verify targeting parameters, and broadcast them directly to specific cohorts of users.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compose form */}
              <div className="card border border-base-300 p-6 rounded-3xl bg-base-50/50 space-y-4">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Compose New Broadcast</h3>
                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Target Cohort</span>
                    </label>
                    <select
                      value={emailCohort}
                      onChange={(e) => setEmailCohort(e.target.value)}
                      className="select select-bordered rounded-2xl w-full"
                    >
                      <option value="all">All Registered Students</option>
                      <option value="free">Free Tier Subscribers</option>
                      <option value="standard">Standard Tier Subscribers</option>
                      <option value="premium">Premium Tier Subscribers</option>
                      <option value="inactive">Inactive Students (No activity in 30 days)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Subject / Title</span>
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Upgrade to Pro & Save 30%!"
                      className="input input-bordered rounded-2xl w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Email Content (Supports Markdown)</span>
                    </label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Write your email body here... Use markdown for headers (#), bold (**), or bullet lists."
                      className="textarea textarea-bordered rounded-2xl w-full h-48 focus:outline-none font-mono text-sm"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="btn btn-primary rounded-2xl w-full font-bold"
                  >
                    {sendingBroadcast ? "Sending Broadcast..." : "Broadcast Email"}
                  </button>
                </form>
              </div>

              {/* Preview & info */}
              <div className="flex flex-col gap-6">
                <div className="card border border-base-300 p-6 rounded-3xl flex-1 flex flex-col min-h-[300px]">
                  <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">Live Template Preview</h3>
                  <div className="flex-1 bg-white dark:bg-slate-900 border border-base-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto max-h-[400px]">
                    {emailSubject ? (
                      <h4 className="text-lg font-black text-slate-800 dark:text-white border-b pb-2 mb-3">
                        {emailSubject}
                      </h4>
                    ) : (
                      <span className="text-slate-400 italic text-sm block mb-3">Enter subject to preview...</span>
                    )}

                    {emailContent ? (
                      <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {/* Super simple markdown parsing for safety & visual wow */}
                        {emailContent
                          .replace(/^#\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-primary">$1</h2>')
                          .replace(/^##\s+(.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-1">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .split("\n")
                          .map((line, idx) => {
                            if (line.startsWith("<h") || line.startsWith("<strong>")) {
                              return <div key={idx} dangerouslySetInnerHTML={{ __html: line }} />;
                            }
                            return <p key={idx} className="mb-2">{line}</p>;
                          })
                        }
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-sm block">Write content to preview output...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Broadcast history list */}
            <div className="border-t border-base-200 pt-6">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4">Past Broadcast History</h3>
              {loadingBroadcasts ? (
                <div className="flex justify-center items-center py-6">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No past email broadcasts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full text-xs">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Subject</th>
                        <th>Target Cohort</th>
                        <th>Recipients</th>
                        <th>Sent By</th>
                        <th>Date Sent</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {broadcasts.map((b) => (
                        <tr key={b._id}>
                          <td className="font-semibold text-slate-800 dark:text-white">{b.subject}</td>
                          <td>
                            <span className="badge badge-sm badge-secondary capitalize">{b.cohort}</span>
                          </td>
                          <td className="font-mono font-bold text-primary">{b.recipientCount} users</td>
                          <td>{b.sentBy}</td>
                          <td>{new Date(b.createdAt).toLocaleString()}</td>
                          <td>
                            <button
                              onClick={() => setSelectedBroadcast(b)}
                              className="btn btn-xs btn-outline rounded-lg flex items-center gap-1"
                            >
                              <PiEye /> View Content
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal for viewing details */}
            {selectedBroadcast && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl rounded-3xl">
                  <h3 className="font-black text-xl mb-2">{selectedBroadcast.subject}</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="badge badge-neutral">Cohort: {selectedBroadcast.cohort.toUpperCase()}</span>
                    <span className="badge badge-primary">{selectedBroadcast.recipientCount} Recipients</span>
                    <span className="badge badge-ghost text-xs">Sent {new Date(selectedBroadcast.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="border border-base-300 bg-base-100 p-4 rounded-2xl max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono text-xs">
                    {selectedBroadcast.content}
                  </div>
                  <div className="modal-action">
                    <button onClick={() => setSelectedBroadcast(null)} className="btn btn-sm rounded-xl">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminConsole;
