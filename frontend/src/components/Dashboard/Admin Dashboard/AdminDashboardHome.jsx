import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { 
  FiUsers, 
  FiFileText, 
  FiTrendingUp, 
  FiUserPlus,
  FiActivity,
  FiCalendar,
  FiArrowRight,
  FiUser
} from "react-icons/fi";
import { motion } from "framer-motion";

const AdminDashboardHome = () => {
  const axiosSecure = useAxiosSecure();

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await axiosSecure.get("/analytics/admin");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-500 font-medium">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  const { overview, recentUsers, studentStats } = analytics;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-4 md:p-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="stat bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{overview.totalUsers}</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <FiUserPlus className="mr-1" /> {overview.usersToday}
            </span>
            <span className="ml-2 text-gray-400">joined today</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tests Taken</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{overview.totalTests}</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <FiFileText className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <FiActivity className="mr-1" /> {overview.testsToday}
            </span>
            <span className="ml-2 text-gray-400">taken today</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Test per User</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                {overview.totalUsers > 0 ? (overview.totalTests / overview.totalUsers).toFixed(1) : 0}
              </div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <FiTrendingUp className="text-orange-600 dark:text-orange-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <FiCalendar className="mr-1" /> Lifetime average
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Today</div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{overview.testsToday}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <FiActivity className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <span className="text-green-500 font-medium">Active</span> sessions now
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Registered Users */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">New Registered Users</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center">
              View all <FiArrowRight className="ml-1" />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentUsers.map((user) => (
              <div key={user._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full inline-block">
                    {user.plan}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Student Performance */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Top Active Students</h2>
            <FiTrendingUp className="text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Tests</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Avg. Score</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Last Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {studentStats.map((student) => (
                  <tr key={student.email} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FiUser className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800 dark:text-white">{student.name || "Unknown"}</div>
                          <div className="text-[10px] text-gray-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{student.testCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-gray-800 dark:text-white">{student.averageScore}%</div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full" 
                          style={{ width: `${student.averageScore}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500 dark:text-gray-400">
                      {new Date(student.lastTest).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboardHome;
