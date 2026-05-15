import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

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

const weakAreas = [
  { title: 'Matching Headings', amount: 62 },
  { title: 'True/False/Not Given', amount: 68 },
  { title: 'Summary Completion', amount: 71 },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = user?.displayName || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    axiosSecure
      .get(`/api/analytics/summary/${user.email}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [axiosSecure, user]);

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
            <Link to="/dashboard/practice" className="btn btn-primary">
              Take a test
            </Link>
            <Link to="/dashboard/analytics" className="btn btn-outline btn-primary">
              View analytics
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-base-300 bg-base-200 p-5">
              <p className="text-sm text-base-content/70">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold">
                {loading ? '—' : summary?.[card.key] ?? '--'}{card.suffix || ''}
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
              className="input input-bordered w-full pr-24"
            />
            <button className="btn btn-primary absolute right-1 top-1/2 -translate-y-1/2">Search</button>
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
            <Link to="/dashboard/review" className="btn btn-outline btn-primary">
              View all
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Band</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">Loading recent attempts…</td>
                  </tr>
                ) : summary?.recentAttempts?.length ? (
                  summary.recentAttempts.map((item) => (
                    <tr key={`${item.date}-${item.type}`}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.type}</td>
                      <td>{item.score}/{item.totalQuestions}</td>
                      <td>{item.band}</td>
                      <td>{item.duration}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8">No recent attempts yet.</td>
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
            {weakAreas.map((area) => (
              <div key={area.title}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{area.title}</span>
                  <span>{area.amount}%</span>
                </div>
                <progress className="progress progress-primary w-full" value={area.amount} max="100"></progress>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-block mt-6">Practice weak areas</button>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
