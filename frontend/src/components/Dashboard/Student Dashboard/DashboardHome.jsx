import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { 
    PiBookOpenFill, 
    PiEarFill, 
    PiPencilLineFill, 
    PiMicrophoneStageFill,
    PiLightningFill,
    PiTrendUpBold,
    PiTargetBold,
    PiFireBold,
    PiExamBold,
    PiArrowRightBold,
    PiCaretRightBold
} from "react-icons/pi";

const quickActions = [
  {
    title: 'Listening',
    icon: <PiEarFill />,
    color: 'bg-purple-500',
    description: 'Master the rhythm of English audio.',
    to: '/dashboard/listening',
  },
  {
    title: 'Reading',
    icon: <PiBookOpenFill />,
    color: 'bg-blue-500',
    description: 'Navigate complex passages with ease.',
    to: '/dashboard/reading',
  },
  {
    title: 'Writing',
    icon: <PiPencilLineFill />,
    color: 'bg-orange-500',
    description: 'Construct powerful academic essays.',
    to: '/dashboard/writing',
  },
  {
    title: 'Speaking',
    icon: <PiMicrophoneStageFill />,
    color: 'bg-green-500',
    description: 'Speak with confidence and clarity.',
    to: '/dashboard/speaking',
  },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const name = user?.displayName || user?.email?.split('@')[0] || 'there';

  const { data: summary, isLoading: loading } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/analytics/summary`);
      return res.data.summary;
    },
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12 pb-20"
    >
      {/* --- HERO SECTION --- */}
      <motion.section 
        variants={item}
        className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-primary to-indigo-700 p-10 lg:p-16 text-white shadow-2xl shadow-primary/30"
      >
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <PiLightningFill className="text-yellow-400" /> Daily Mission Active
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
              Ready to crush it, <span className="text-yellow-300">{name}</span>?
            </h1>
            <p className="text-lg lg:text-xl text-white/80 font-medium max-w-xl leading-relaxed">
              Your personalized IELTS path is ready. We've analyzed your past attempts and optimized today's focus areas.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/dashboard/full-mock-test" className="btn btn-lg rounded-2xl bg-white text-primary border-none hover:bg-yellow-300 hover:text-black transition-all px-8 font-black shadow-xl">
                    Start Full Mock Test
                </Link>
                <Link to="/dashboard/analytics" className="btn btn-lg rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md px-8 font-black transition-all">
                    Insight Reports
                </Link>
            </div>
          </div>

          {/* Stats Floating In Hero */}
          <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Accuracy</div>
                <div className="text-3xl font-black">{summary?.averageAccuracy ?? "0"}%</div>
             </div>
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Est. Band</div>
                <div className="text-3xl font-black">{summary?.estimatedBand ?? "5.0"}</div>
             </div>
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Attempts</div>
                <div className="text-3xl font-black">{summary?.testsCompleted ?? "0"}</div>
             </div>
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Streak</div>
                <div className="text-3xl font-black">{summary?.studyStreak ?? "0"}d</div>
             </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-primary-focus/20 blur-3xl" />
      </motion.section>

      {/* --- QUICK ACTIONS --- */}
      <motion.section variants={item}>
        <div className="mb-8 flex items-end justify-between px-4">
            <div>
                <h2 className="text-2xl font-black tracking-tight">Focused Training</h2>
                <p className="text-sm font-bold text-base-content/40 uppercase tracking-widest mt-1">Section Specific Practice</p>
            </div>
            <Link to="/dashboard/practice" className="group flex items-center gap-2 text-sm font-black text-primary hover:gap-3 transition-all">
                View All Labs <PiArrowRightBold />
            </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-base-300 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2"
            >
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white shadow-lg ${action.color}`}>
                {action.icon}
              </div>
              <div className="mb-2 text-xl font-black group-hover:text-primary transition-colors">{action.title}</div>
              <p className="text-sm text-base-content/60 leading-relaxed">{action.description}</p>
              
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Lab <PiCaretRightBold />
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* --- PERFORMANCE SPLIT --- */}
      <div className="grid gap-10 xl:grid-cols-[1.8fr_1fr]">
        {/* Recent Activity Card */}
        <motion.section variants={item} className="rounded-[3rem] border border-base-300 bg-white p-10 shadow-sm">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">
                <PiTrendUpBold />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Activity Feed</h2>
                <p className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest mt-0.5">Live session tracking</p>
              </div>
            </div>
            <Link to="/dashboard/review" className="btn btn-outline btn-primary rounded-2xl px-6 font-black">
              History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-base-content/30 border-b-base-200">
                  <th className="font-black text-[10px] uppercase tracking-widest pb-6">Timeline</th>
                  <th className="font-black text-[10px] uppercase tracking-widest pb-6">Assessment</th>
                  <th className="font-black text-[10px] uppercase tracking-widest pb-6">Performance</th>
                  <th className="font-black text-[10px] uppercase tracking-widest pb-6">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {loading ? (
                    [1,2,3].map(i => <tr key={i}><td colSpan="4" className="h-16 animate-pulse bg-base-100/50 rounded-lg"></td></tr>)
                ) : summary?.recentAttempts?.length ? (
                  summary.recentAttempts.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-base-50 transition-colors">
                      <td className="py-6 font-bold text-sm text-base-content/50">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-6">
                        <div className="font-black text-primary group-hover:tracking-wide transition-all">{item.testName}</div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-lg">{item.accuracy}%</span>
                            <div className="h-1.5 w-12 rounded-full bg-base-200 overflow-hidden shadow-inner">
                                <div className="h-full bg-primary" style={{ width: `${item.accuracy}%` }} />
                            </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="badge badge-ghost font-black px-4 py-4 rounded-xl border-base-300">
                            {item.band}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-base-content/20 italic font-medium">No recent attempts recorded. Start your journey today!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Areas of Improvement Card */}
        <motion.section variants={item} className="rounded-[3rem] border border-base-300 bg-white p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/5 text-8xl">
                <PiTargetBold />
            </div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-black tracking-tight mb-2">Growth Matrix</h2>
                <p className="text-sm font-bold text-base-content/40 uppercase tracking-widest mb-10">Optimized focus zones</p>

                <div className="space-y-8">
                    {(summary?.weakAreas || [
                    { title: 'Time Allocation', percentage: 65 },
                    { title: 'Lexical Resource', percentage: 72 },
                    { title: 'Grammar Precision', percentage: 58 }
                    ]).map((area) => (
                    <div key={area.title} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/50">{area.title}</span>
                            <span className="text-sm font-black text-primary">{area.percentage}%</span>
                        </div>
                        <div className="relative h-4 w-full overflow-hidden rounded-full bg-base-200 p-1 border border-base-300 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${area.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-linear-to-r from-primary to-indigo-500 shadow-sm"
                            />
                        </div>
                    </div>
                    ))}
                </div>

                <div className="mt-12 rounded-3xl bg-primary/5 p-6 border border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                        <PiLightningFill className="text-yellow-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Smart Tip</span>
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-base-content/60 italic">
                        "Your Time Allocation has improved by 5% this week. Keep up the pace in Reading Section 3."
                    </p>
                </div>

                <button className="btn btn-primary btn-block mt-10 rounded-[1.5rem] h-14 font-black shadow-xl shadow-primary/20">
                    Targeted Practice
                </button>
            </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
