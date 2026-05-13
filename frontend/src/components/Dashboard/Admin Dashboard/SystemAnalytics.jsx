import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PiHardDrive, 
  PiCpu, 
  PiUsers, 
  PiWarningCircle,
  PiCheckCircle,
  PiGlobeHemisphereWest
} from 'react-icons/pi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const SystemAnalytics = () => {
    const axiosSecure = useAxiosSecure();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Assuming an endpoint exists at admin/system-analytics
                const res = await axiosSecure.get('/admin/system-analytics');
                setData(res.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch system analytics:", err);
                setError("Failed to load system data");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        
        // Optional: Polling every 30 seconds for "real-time" feel
        const intervalId = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(intervalId);
    }, [axiosSecure]);

    // Fallback/Default data if backend returns partial data
    const statsData = data?.stats || {
        cpuUsage: "0%", cpuTrend: "0%", cpuStatus: "normal",
        memoryUsage: "0 GB", memoryTrend: "0 GB Total", memoryStatus: "normal",
        activeConnections: "0", connectionsTrend: "0%", connectionsStatus: "normal",
        networkTraffic: "0 TB", networkTrend: "This Month", networkStatus: "normal"
    };

    const healthData = data?.health || {
        apiResponseTime: 0,
        databaseLoad: 0,
        storageCapacity: 0
    };

    const logs = data?.logs || [];

    const stats = [
        {
            title: "CPU Usage",
            value: statsData.cpuUsage,
            trend: statsData.cpuTrend,
            status: statsData.cpuStatus,
            icon: <PiCpu className="w-6 h-6" />
        },
        {
            title: "Memory Usage",
            value: statsData.memoryUsage,
            trend: statsData.memoryTrend,
            status: statsData.memoryStatus,
            icon: <PiHardDrive className="w-6 h-6" />
        },
        {
            title: "Active Connections",
            value: statsData.activeConnections,
            trend: statsData.connectionsTrend,
            status: statsData.connectionsStatus,
            icon: <PiUsers className="w-6 h-6" />
        },
        {
            title: "Network Traffic",
            value: statsData.networkTraffic,
            trend: statsData.networkTrend,
            status: statsData.networkStatus,
            icon: <PiGlobeHemisphereWest className="w-6 h-6" />
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <motion.div 
            className="p-6 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                    <p className="text-base-content/60 mt-1">Real-time overview of platform infrastructure</p>
                </div>
                {error ? (
                    <div className="flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-full text-sm font-medium">
                        <PiWarningCircle className="w-4 h-4" />
                        {error}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </span>
                        All Systems Operational
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div 
                        key={index}
                        variants={itemVariants}
                        className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200/60 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                stat.status === 'success' ? 'bg-success/10 text-success' : 
                                stat.status === 'error' ? 'bg-error/10 text-error' :
                                'bg-base-200 text-base-content/70'
                            }`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-base-content/60 text-sm font-medium">{stat.title}</h3>
                        <p className="text-3xl font-bold mt-1">{loading ? '...' : stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Overview */}
                <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200/60 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Server Health</h2>
                        <button className="btn btn-sm btn-ghost">View Detailed Report</button>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium flex items-center gap-2"> API Response Time</span>
                                <span className="text-base-content/60">{loading ? '...' : `${healthData.apiResponseTime}ms (avg)`}</span>
                            </div>
                            <progress className="progress progress-primary w-full" value={healthData.apiResponseTime} max="1000"></progress>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium flex items-center gap-2"><PiCpu /> Database Load</span>
                                <span className="text-base-content/60">{loading ? '...' : `${healthData.databaseLoad}%`}</span>
                            </div>
                            <progress className={`progress w-full ${healthData.databaseLoad > 80 ? 'progress-error' : healthData.databaseLoad > 50 ? 'progress-warning' : 'progress-primary'}`} value={healthData.databaseLoad} max="100"></progress>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium flex items-center gap-2"><PiHardDrive /> Storage Capacity</span>
                                <span className="text-base-content/60">{loading ? '...' : `${healthData.storageCapacity}%`}</span>
                            </div>
                            <progress className={`progress w-full ${healthData.storageCapacity > 80 ? 'progress-error' : healthData.storageCapacity > 50 ? 'progress-warning' : 'progress-primary'}`} value={healthData.storageCapacity} max="100"></progress>
                        </div>
                    </div>
                </motion.div>

                {/* System Logs */}
                <motion.div variants={itemVariants} className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200/60 flex flex-col">
                    <h2 className="text-xl font-bold mb-6">Recent Logs</h2>
                    <div className="flex-1 space-y-4">
                        {logs.length === 0 && !loading && (
                            <p className="text-sm text-base-content/60 italic text-center py-4">No recent logs found.</p>
                        )}
                        {logs.map((log, idx) => (
                            <div key={log.id || idx} className="flex gap-4 items-start">
                                <div className={`mt-1 flex-shrink-0 ${
                                    log.status === 'success' ? 'text-success' :
                                    log.status === 'error' ? 'text-error' : 'text-warning'
                                }`}>
                                    {log.status === 'success' ? <PiCheckCircle className="w-5 h-5" /> :
                                     <PiWarningCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium line-clamp-2">{log.message}</p>
                                    <div className="flex gap-2 text-xs text-base-content/50 mt-1">
                                        <span>{log.type}</span>
                                        <span>•</span>
                                        <span>{log.time || new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {logs.length > 0 && <button className="btn btn-outline btn-block mt-6">View All Logs</button>}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SystemAnalytics;
