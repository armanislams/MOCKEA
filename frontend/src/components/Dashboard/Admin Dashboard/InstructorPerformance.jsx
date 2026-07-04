import React from "react";
import { 
  PiGraduationCap, 
  PiClock, 
  PiCheckCircle, 
  PiStar, 
  PiUser,
  PiLockKey
} from "react-icons/pi";
import { motion } from "framer-motion";
import useAdminQuery from "../../../hooks/useAdminQuery";
import PageHeader from "../../Common/PageHeader";
import TableShell from "../../Common/TableShell";
import StatCard from "../../Common/StatCard";

const InstructorPerformance = () => {
  const { data: performanceData = [], isLoading, isError, refetch } = useAdminQuery(
    ["instructor-performance"],
    "/analytics/instructor-performance",
    "data"
  );

  // Compute global summary metrics
  const totalInstructors = performanceData.length;
  const overallReviews = performanceData.reduce((sum, inst) => sum + (inst.totalReviews || 0), 0);
  
  // Calculate average TAT across all instructors with grading activity
  const activeInstructors = performanceData.filter(inst => inst.totalReviews > 0);
  const avgTatHours = activeInstructors.length > 0 
    ? activeInstructors.reduce((sum, inst) => sum + (inst.avgTatHours || 0), 0) / activeInstructors.length
    : 0;

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
    visible: { y: 0, opacity: 1 }
  };

  const getTatBadgeColor = (hours) => {
    if (hours === 0) return "badge-ghost";
    if (hours < 12) return "badge-success bg-green-500/10 text-green-600 border-none";
    if (hours <= 24) return "badge-warning bg-yellow-500/10 text-yellow-600 border-none";
    return "badge-error bg-red-500/10 text-red-600 border-none";
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-4 md:p-6"
    >
      {/* Header */}
      <PageHeader
        title="Tutor Performance Analytics"
        subtitle="Monitor evaluation activities, grading responsiveness, and quality metrics across all registered instructors."
        className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Registered Tutors"
          value={totalInstructors}
          icon={<PiGraduationCap />}
          color="blue"
          variants={itemVariants}
          description={<span className="text-slate-400">Total Active Instructors</span>}
        />
        <StatCard
          label="Total Graded Evaluations"
          value={overallReviews}
          icon={<PiCheckCircle />}
          color="green"
          variants={itemVariants}
          description={<span className="text-slate-400">Mock Tests + Practice Labs</span>}
        />
        <StatCard
          label="Average Response TAT"
          value={`${Math.round(avgTatHours * 10) / 10} Hrs`}
          icon={<PiClock />}
          color="orange"
          variants={itemVariants}
          description={<span className="text-slate-400">Avg Turnaround Response</span>}
        />
      </div>

      {/* Main Table */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
            Performance Breakdown
          </h2>
          <button 
            onClick={() => refetch()} 
            className="btn btn-ghost btn-sm font-black uppercase tracking-wider text-primary"
          >
            Refresh Data
          </button>
        </div>

        <TableShell
          isLoading={isLoading}
          isError={isError}
          empty={performanceData.length === 0}
          emptyTitle="No Tutors Found"
          emptyText="There are no users registered under the instructor role."
          onRetry={refetch}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">Tutor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest text-center">Practice Graded</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest text-center">Mock Sections Graded</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest text-center">Total Graded</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest text-center">Active Locks</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest text-center">Avg Response Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest text-right">Avg Band Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                {performanceData.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                          {inst.name ? inst.name.charAt(0).toUpperCase() : <PiUser />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white leading-tight">
                            {inst.name || "Unknown Tutor"}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-gray-500 font-medium">
                            {inst.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {inst.practiceCount}
                    </td>
                    <td className="px-6 py-5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {inst.mockCount}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-primary">
                      {inst.totalReviews}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {inst.lockedCount > 0 ? (
                        <span className="badge badge-warning gap-1 font-bold">
                          <PiLockKey className="w-3.5 h-3.5" />
                          {inst.lockedCount}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">None</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`badge font-bold ${getTatBadgeColor(inst.avgTatHours)}`}>
                        {inst.totalReviews > 0 ? `${inst.avgTatHours} Hrs` : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-orange-500">
                      <div className="flex items-center justify-end gap-1">
                        <PiStar className="w-4 h-4 fill-orange-500/20" />
                        {inst.totalReviews > 0 ? inst.avgBandScore.toFixed(1) : "0.0"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableShell>
      </motion.div>
    </motion.div>
  );
};

export default InstructorPerformance;
