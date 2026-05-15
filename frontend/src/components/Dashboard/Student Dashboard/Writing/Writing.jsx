const Writing = () => {
  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border border-base-300 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-2">Writing Practice</p>
            <h1 className="text-3xl font-bold">IELTS Writing Test</h1>
            <p className="mt-3 text-base-content/75 max-w-2xl">
              Practice writing responses for Task 1 and Task 2 with prompts designed for IELTS Academic and General Training.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-base-300 bg-base-200 p-5">
              <h2 className="text-xl font-semibold mb-3">Task 1</h2>
              <p className="text-base-content/75 mb-4">
                Analyze the chart, graph, or process and write a cohesive response within the time limit.
              </p>
              <div className="badge badge-outline">20 minutes</div>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-200 p-5">
              <h2 className="text-xl font-semibold mb-3">Task 2</h2>
              <p className="text-base-content/75 mb-4">
                Compose an essay in response to an argument, problem, or opinion prompt for higher band practice.
              </p>
              <div className="badge badge-outline">40 minutes</div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-base-content/75">
              Start with the first task and write your answer in the editor below. When you're ready, submit your draft for feedback or self-review.
            </p>
            <button className="btn btn-primary mt-6">Start Writing Test</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Writing;
