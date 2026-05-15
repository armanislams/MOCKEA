import { useEffect, useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const Review = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    axiosSecure
      .get(`/api/reading/history/${user.email}`)
      .then((res) => {
        setHistory(res.data.readings || []);
      })
      .catch(() => {
        setHistory([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [axiosSecure, user]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
          Review
        </p>
        <h1 className="text-3xl font-bold">Practice history</h1>
        <p className="text-base-content/70 mt-2 max-w-2xl">
          Revisit your completed tests and review answer summaries to track
          improvement across practice sessions.
        </p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent reading attempts</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reading ID</th>
                <th>Score</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    Loading attempt history...
                  </td>
                </tr>
              ) : history.length ? (
                history.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.completedAt).toLocaleDateString()}</td>
                    <td>{item.readingId}</td>
                    <td>{item.score}%</td>
                    <td>{item.totalQuestions}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    No completed reading attempts available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Review;
