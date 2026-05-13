import os from 'os';

export const getSystemAnalytics = async (req, res, next) => {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);
        
        // Mock some dynamic stats
        const activeConnections = Math.floor(Math.random() * 500) + 1000; 
        const cpuUsage = Math.floor(Math.random() * 40) + 10; 
        const apiResponseTime = Math.floor(Math.random() * 50) + 20;
        const databaseLoad = Math.floor(Math.random() * 30) + 30;

        res.json({
            stats: {
                cpuUsage: `${cpuUsage}%`,
                cpuTrend: "+2%",
                cpuStatus: cpuUsage > 80 ? "error" : cpuUsage > 60 ? "warning" : "normal",
                
                memoryUsage: `${(usedMem / (1024 ** 3)).toFixed(1)} GB`,
                memoryTrend: `${(totalMem / (1024 ** 3)).toFixed(1)} GB Total`,
                memoryStatus: memoryUsagePercent > 80 ? "error" : memoryUsagePercent > 60 ? "warning" : "normal",
                
                activeConnections: activeConnections.toString(),
                connectionsTrend: "+5%",
                connectionsStatus: "success",
                
                networkTraffic: "1.4 TB",
                networkTrend: "This Month",
                networkStatus: "normal"
            },
            health: {
                apiResponseTime: apiResponseTime, 
                databaseLoad: databaseLoad,    
                storageCapacity: 76
            },
            logs: [
                { id: 1, timestamp: new Date().toISOString(), type: "Info", message: "System running smoothly", status: "success" },
                { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), type: "Warning", message: "High latency on analytics route", status: "warning" },
                { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), type: "Info", message: "Automated backup completed", status: "success" }
            ]
        });
    } catch (error) {
        next(error);
    }
};
