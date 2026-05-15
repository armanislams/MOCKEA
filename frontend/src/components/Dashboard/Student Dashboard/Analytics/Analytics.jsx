import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import Loader from "../../../Loader/Loader";
import { 
    PiChartLineUpBold, 
    PiTargetBold, 
    PiExamBold, 
    PiFireBold,
    PiClockBold,
    PiCheckCircleBold
} from "react-icons/pi";

const Analytics = () => {
  const axiosSecure = useAxiosSecure();

  const { data: summary, isLoading: loading } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/analytics/summary`);
      return res.data.summary;
    },
  });

  if (loading) return <Loader />;

  const stats = [
    {
      title: "Average Accuracy",
      value: `${summary?.averageAccuracy ?? "0"}%`,
      icon: <PiTargetBold className="text-primary" />,
      desc: "Based on objective sections"
    },
    { 
        title: "Estimated Band", 
        value: summary?.estimatedBand ?? "5.0", 
        icon: <PiChartLineUpBold className="text-success" />,
        desc: "Current predicted level"
    },
    { 
        title: "Tests Completed", 
        value: summary?.testsCompleted ?? "0", 
        icon: <PiExamBold className="text-info" />,
        desc: "Full mock test attempts"
    },
    { 
        title: "Study Streak", 
        value: `${summary?.studyStreak ?? "0"} days`, 
        icon: <PiFireBold className="text-warning" />,
        desc: "Consecutive practice days"
    },
  ];

  return (
    <div className="space-y-10">
        {/* Header */}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-black mb-2">Performance Dashboard</p>
          <h1 className="text-4xl font-black tracking-tight">Personalized Insights</h1>
          <p className="text-base-content/60 mt-3 max-w-2xl text-lg leading-relaxed">
            Analyze your growth trends. We track your accuracy across all mock tests 
            to help you identify exactly where to focus your study time.
          </p>
        </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.title}
            className="card bg-white border border-base-300 shadow-sm p-8 rounded-[2.5rem] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-black uppercase tracking-widest text-base-content/40">{s.title}</div>
                <div className="text-2xl">{s.icon}</div>
            </div>
            <div className="text-4xl font-black tracking-tighter">
              {s.value}
            </div>
            <div className="mt-2 text-[10px] font-bold text-base-content/30 uppercase tracking-widest">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Recent Attempts */}
        <div className="xl:col-span-2 card bg-white border border-base-300 shadow-sm p-10 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">Recent performance</h2>
            <PiClockBold className="text-2xl text-base-content/20" />
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-base-content/40 border-b-base-300">
                  <th className="font-black text-[10px] uppercase tracking-widest">Date</th>
                  <th className="font-black text-[10px] uppercase tracking-widest">Assessment</th>
                  <th className="font-black text-[10px] uppercase tracking-widest">Accuracy</th>
                  <th className="font-black text-[10px] uppercase tracking-widest">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {summary?.recentAttempts?.length ? (
                  summary.recentAttempts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-base-50 transition-colors">
                      <td className="py-5 font-bold text-sm">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-5 font-bold text-sm text-primary">{item.testName}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                            <span className="font-black">{item.accuracy}%</span>
                            <div className="w-16 h-1.5 bg-base-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${item.accuracy}%` }} />
                            </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="badge badge-ghost font-black px-4 py-3 rounded-lg text-xs">{item.band}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-20 opacity-30">
                      <PiCheckCircleBold className="text-5xl mx-auto mb-4" />
                      <p className="font-bold">No recent attempts recorded</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth Areas */}
        <div className="card bg-white border border-base-300 shadow-sm p-10 rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">Growth Areas</h2>
            <PiChartLineUpBold className="text-2xl text-base-content/20" />
          </div>
          <div className="space-y-8">
            {(summary?.weakAreas || []).map((area) => (
              <div key={area.title} className="space-y-3">
                <div className="flex items-center justify-between font-black uppercase tracking-widest text-[10px]">
                  <span className="text-base-content/50">{area.title}</span>
                  <span className="text-primary">{area.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden p-0.5 border border-base-300 shadow-inner">
                    <div 
                        className="h-full bg-linear-to-r from-primary to-secondary rounded-full shadow-sm" 
                        style={{ width: `${area.percentage}%` }}
                    />
                </div>
              </div>
            ))}
            <div className="mt-10 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <p className="text-xs font-bold leading-relaxed text-primary/70 italic">
                    "Consistent practice in your growth areas will yield the fastest band score improvement."
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
