import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import useAxios from "../../hooks/useAxios";

export default function GuestTestLibrary() {
  const axiosPublic = useAxios();

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["public-mock-tests"],
    queryFn: async () => {
      const res = await axiosPublic.get("/public-mock-tests");
      return res.data.tests ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <>
      <main className="min-h-screen bg-base-200 p-8">
        <h1 className="text-3xl font-bold mb-6">Free Practice Mock Tests</h1>
        {tests.length === 0 ? (
          <p className="text-center text-base-content/60">No public tests available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <div key={test._id} className="card bg-white shadow-lg p-6 rounded-2xl hover:shadow-2xl transition-shadow">
                <span className={`badge mb-3 ${test.testType === 'speaking' ? 'badge-success' : 'badge-info'}`}>
                  {test.testType?.toUpperCase()}
                </span>
                <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                <p className="text-sm text-base-content/70 mb-4">{test.instructions}</p>
                <Link to={`/free-practice/tests/${test._id}`} className="btn btn-primary btn-sm mt-2">
                  Start Test
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
