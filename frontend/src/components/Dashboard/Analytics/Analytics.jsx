import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const Analytics = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    axiosSecure
      .get(`/api/analytics/summary/${user.email}`)
      .then((res) => {
        setSummary(res.data.summary);
      })
      .catch(() => {
        setSummary(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [axiosSecure, user]);

  const cards = [
    { title: 'Average Accuracy', value: `${summary?.averageAccuracy ?? '--'}%` },
    { title: 'Estimated Band', value: summary?.estimatedBand ?? '--' },
    { title: 'Tests Completed', value: summary?.testsCompleted ?? '--' },
    { title: 'Study Streak', value: `${summary?.studyStreak ?? '--'} days` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Analytics</p>
          <h1 className="text-3xl font-bold">Performance insights</h1>
          <p className="text-base-content/70 mt-2 max-w-2xl">
            Review your latest score trends, strengths, and areas to focus on before your next practice run.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="card bg-base-100 border border-base-300 shadow-sm p-6">
            <div className="text-sm text-base-content/70">{card.title}</div>
            <div className="mt-4 text-3xl font-semibold">{loading ? 'Loading...' : card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 card bg-base-100 border border-base-300 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent attempts</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Band</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">Loading analytics...</td>
                  </tr>
                ) : summary?.recentAttempts?.length ? (
                  summary.recentAttempts.map((item) => (
                    <tr key={`${item.date}-${item.type}`}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.type}</td>
                      <td>{item.score}/{item.totalQuestions}</td>
                      <td>{item.band}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8">No attempt data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Strongest areas</h2>
          <div className="space-y-4">
            {(summary?.weakAreas || []).map((area) => (
              <div key={area.title}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{area.title}</span>
                  <span>{area.percentage}%</span>
                </div>
                <progress className="progress progress-primary w-full" value={area.percentage} max="100"></progress>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
