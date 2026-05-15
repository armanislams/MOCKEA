import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const quickActions = [
  {
    title: 'Listening Test',
    description: 'Practice IELTS listening tasks with audio and guided questions.',
    to: '/dashboard/listening',
  },
  {
    title: 'Reading Test',
    description: 'Work through passages and answer reading comprehension questions.',
    to: '/dashboard/reading',
  },
  {
    title: 'Writing Test',
    description: 'Draft responses to IELTS writing prompts and improve your score.',
    to: '/dashboard/writing',
  },
  {
    title: 'Speaking Test',
    description: 'Build confidence with quick speaking tasks and topic prompts.',
    to: '/dashboard/speaking',
  },
];

const statCards = [
  { label: 'Average Accuracy', key: 'averageAccuracy', suffix: '%' },
  { label: 'Estimated Band', key: 'estimatedBand' },
  { label: 'Tests Completed', key: 'testsCompleted' },
  { label: 'Study Streak', key: 'studyStreak', suffix: ' days' },
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

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-base-100 border border-base-300 p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-2">Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {name}</h1>
            <p className="mt-4 text-base-content/75 max-w-2xl">
              Your study hub for IELTS practice. Start a new test, review your recent attempts, and track weak areas from one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/dashboard/full-mock-test" className="btn btn-primary rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/20">
              Take a full test
            </Link>
            <Link to="/dashboard/analytics" className="btn btn-outline btn-primary rounded-2xl px-8 h-14 font-black">
              View analytics
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-base-300 bg-base-200 p-5">
              <p className="text-sm text-base-content/70">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold">
                {loading ? '—' : (summary?.[card.key] ?? '--')}{card.suffix || ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Take a Test</h2>
            <p className="text-base-content/70 mt-1">Select an IELTS section to begin practice with dedicated test cards.</p>
          </div>
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search tests, topics..."
              className="input input-bordered w-full pr-24 rounded-2xl"
            />
            <button className="btn btn-primary absolute right-1 top-1/2 -translate-y-1/2 rounded-xl">Search</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary"
            >
              <div className="mb-4 text-2xl font-semibold group-hover:text-primary">{action.title}</div>
              <p className="text-base-content/75">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Attempts</h2>
              <p className="text-base-content/70 mt-1">Your latest sessions are tracked here for quick review.</p>
            </div>
            <Link to="/dashboard/review" className="btn btn-outline btn-primary rounded-2xl font-black">
              View all
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-base-content/40">
                  <th className="font-bold uppercase tracking-widest text-[10px]">Date</th>
                  <th className="font-bold uppercase tracking-widest text-[10px]">Assessment</th>
                  <th className="font-bold uppercase tracking-widest text-[10px]">Accuracy</th>
                  <th className="font-bold uppercase tracking-widest text-[10px]">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">Loading recent attempts…</td>
                  </tr>
                ) : summary?.recentAttempts?.length ? (
                  summary.recentAttempts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-base-50 transition-colors">
                      <td className="py-5 font-medium">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-5 font-bold text-primary">{item.testName}</td>
                      <td className="py-5 font-black">{item.accuracy}%</td>
                      <td className="py-5">
                        <span className="badge badge-ghost font-black px-4 py-3 rounded-lg">{item.band}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 opacity-40 italic">No recent attempts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Areas to Improve</h2>
              <p className="text-base-content/70 mt-1">Focus on the question types where you need more practice.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {(summary?.weakAreas || [
              { title: 'Time Management', percentage: 65 },
              { title: 'Vocabulary Range', percentage: 72 }
            ]).map((area) => (
              <div key={area.title}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-base-content/50 uppercase tracking-widest text-[10px]">{area.title}</span>
                  <span className="text-primary font-black">{area.percentage}%</span>
                </div>
                <progress className="progress progress-primary w-full h-2 rounded-full mt-1" value={area.percentage} max="100"></progress>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-block mt-8 rounded-[1.5rem] font-black shadow-lg shadow-primary/10">
            Practice weak areas
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
