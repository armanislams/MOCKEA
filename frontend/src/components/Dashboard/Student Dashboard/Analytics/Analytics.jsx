import { useState } from "react";
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
  const [activePoint, setActivePoint] = useState(null);

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
        title: "Completed Attempts", 
        value: `${(summary?.testsCompleted ?? 0) + (summary?.practicesCompleted ?? 0)}`, 
        icon: <PiExamBold className="text-info" />,
        desc: `Mock Tests: ${summary?.testsCompleted ?? 0} | Practices: ${summary?.practicesCompleted ?? 0}`
    },
    { 
        title: "Study Streak", 
        value: `${summary?.studyStreak ?? "0"} days`, 
        icon: <PiFireBold className="text-warning" />,
        desc: "Consecutive practice days"
    },
  ];

  // SVG Chart Calculations
  const chartData = [...(summary?.recentAttempts || [])].reverse();
  const minBand = 4;
  const maxBand = 9;
  const chartWidth = 500;
  const chartHeight = 200;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  let pathD = "";
  let areaD = "";

  if (chartData.length > 0) {
    chartData.forEach((item, idx) => {
      const xVal = paddingLeft + (idx * (plotWidth / (chartData.length - 1 || 1)));
      const yPercent = (item.band - minBand) / (maxBand - minBand);
      const boundedYPercent = Math.max(0, Math.min(1, yPercent));
      const yVal = chartHeight - paddingBottom - (boundedYPercent * plotHeight);

      if (idx === 0) {
        pathD += `M ${xVal} ${yVal}`;
      } else {
        const prevX = paddingLeft + ((idx - 1) * (plotWidth / (chartData.length - 1 || 1)));
        const prevYPercent = (chartData[idx - 1].band - minBand) / (maxBand - minBand);
        const prevBoundedYPercent = Math.max(0, Math.min(1, prevYPercent));
        const prevY = chartHeight - paddingBottom - (prevBoundedYPercent * plotHeight);

        const cpX1 = prevX + (xVal - prevX) / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + (xVal - prevX) / 2;
        const cpY2 = yVal;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${xVal} ${yVal}`;
      }
    });

    const firstX = paddingLeft;
    const lastX = paddingLeft + ((chartData.length - 1) * (plotWidth / (chartData.length - 1 || 1)));
    areaD = `${pathD} L ${lastX} ${chartHeight - paddingBottom} L ${firstX} ${chartHeight - paddingBottom} Z`;
  }

  const gridBands = [5, 6, 7, 8, 9];

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

          {/* SVG Performance Growth Graph */}
          {chartData.length >= 2 ? (
            <div className="relative mb-10 bg-slate-50 dark:bg-gray-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-gray-800">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {gridBands.map((band) => {
                  const yVal = chartHeight - paddingBottom - (((band - minBand) / (maxBand - minBand)) * plotHeight);
                  return (
                    <g key={band}>
                      <line 
                        x1={paddingLeft} 
                        y1={yVal} 
                        x2={chartWidth - paddingRight} 
                        y2={yVal} 
                        stroke="currentColor" 
                        className="text-slate-200 dark:text-gray-800" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingLeft - 12} 
                        y={yVal + 3.5} 
                        textAnchor="end" 
                        className="text-[9px] font-black text-slate-400 dark:text-gray-500 fill-current font-mono"
                      >
                        Band {band.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Plot Area Fill */}
                <path d={areaD} fill="url(#chartAreaGrad)" />

                {/* Plot Line */}
                <path d={pathD} fill="none" stroke="url(#chartLineGrad)" strokeWidth="3" strokeLinecap="round" />

                {/* Interactive Points and Labels */}
                {chartData.map((item, idx) => {
                  const xVal = paddingLeft + (idx * (plotWidth / (chartData.length - 1 || 1)));
                  const yPercent = (item.band - minBand) / (maxBand - minBand);
                  const boundedYPercent = Math.max(0, Math.min(1, yPercent));
                  const yVal = chartHeight - paddingBottom - (boundedYPercent * plotHeight);
                  return (
                    <g key={idx}>
                      {/* X Axis Labels */}
                      <text 
                        x={xVal} 
                        y={chartHeight - paddingBottom + 20} 
                        textAnchor="middle" 
                        className="text-[10px] font-black text-slate-400 dark:text-gray-500 fill-current font-mono"
                      >
                        {new Date(item.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                      </text>

                      {/* Interactive Target Area */}
                      <circle 
                        cx={xVal} 
                        cy={yVal} 
                        r="14" 
                        fill="transparent" 
                        className="cursor-pointer"
                        tabIndex={0}
                        role="img"
                        aria-label={`Band ${item.band}, ${item.accuracy !== null ? item.accuracy + '% accuracy' : 'N/A'} on ${new Date(item.date).toLocaleDateString()}`}
                        onMouseEnter={() => setActivePoint(idx)}
                        onMouseLeave={() => setActivePoint(null)}
                        onFocus={() => setActivePoint(idx)}
                        onBlur={() => setActivePoint(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActivePoint(activePoint === idx ? null : idx);
                          }
                        }}
                      />

                      {/* Active Visual Ring */}
                      <circle 
                        cx={xVal} 
                        cy={yVal} 
                        r={activePoint === idx ? "7" : "5"} 
                        stroke="url(#chartLineGrad)" 
                        strokeWidth="2.5" 
                        fill={activePoint === idx ? "#ffffff" : "currentColor"}
                        className={`${activePoint === idx ? "text-white" : "text-white dark:text-gray-900"} transition-all pointer-events-none`}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Glassmorphic Info Tooltip */}
              {activePoint !== null && (
                <div 
                  className="absolute bg-slate-950/95 dark:bg-gray-950/95 text-white p-4 rounded-2xl border border-slate-800 dark:border-gray-800 shadow-2xl backdrop-blur-lg text-xs font-mono z-10 pointer-events-none transition-all duration-200"
                  style={{
                    left: `${paddingLeft + (activePoint * (plotWidth / (chartData.length - 1 || 1))) - 60}px`,
                    top: `${chartHeight - paddingBottom - (Math.max(0, Math.min(1, (chartData[activePoint].band - minBand) / (maxBand - minBand))) * plotHeight) - 82}px`,
                  }}
                >
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">
                    {new Date(chartData[activePoint].date).toLocaleDateString()}
                  </div>
                  <div className="font-extrabold text-sm mb-1 text-slate-100">
                    Band: <span className="text-emerald-400 font-black">Band {chartData[activePoint].band}</span>
                  </div>
                  <div className="text-slate-400 font-bold text-[10px] tracking-wide">
                    Accuracy: <span className="text-slate-200">{chartData[activePoint].accuracy !== null ? `${chartData[activePoint].accuracy}%` : "N/A"}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-10 p-10 bg-slate-50 dark:bg-gray-900/10 rounded-[2rem] border border-dashed border-slate-200 dark:border-gray-850 text-center text-slate-400 dark:text-gray-500 text-xs font-black uppercase tracking-wider">
              Take at least two mock tests to unlock interactive band score tracking analytics.
            </div>
          )}

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
                        {item.accuracy !== null ? (
                          <div className="flex items-center gap-2">
                              <span className="font-black">{item.accuracy}%</span>
                              <div className="w-16 h-1.5 bg-base-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${item.accuracy}%` }} />
                              </div>
                          </div>
                        ) : (
                          <span className="text-base-content/40 font-bold text-xs uppercase tracking-widest">N/A</span>
                        )}
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
                    "{summary?.smartTip || "Consistent practice in your growth areas will yield the fastest band score improvement."}"
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
