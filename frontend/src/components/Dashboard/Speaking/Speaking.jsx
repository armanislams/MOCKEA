const Speaking = () => {
  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border border-base-300 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-2">Speaking Practice</p>
            <h1 className="text-3xl font-bold">IELTS Speaking Test</h1>
            <p className="mt-3 text-base-content/75 max-w-2xl">
              Practice speaking responses with sample cue cards, short questions, and fluency-building prompts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-base-300 bg-base-200 p-5">
              <h2 className="text-xl font-semibold mb-3">Part 1</h2>
              <p className="text-base-content/75 mb-4">
                Answer short introductory questions about home, work, studies, and interests.
              </p>
              <div className="badge badge-outline">4-5 minutes</div>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-200 p-5">
              <h2 className="text-xl font-semibold mb-3">Part 2</h2>
              <p className="text-base-content/75 mb-4">
                Speak for one minute on a cue card topic, then answer follow-up questions.
              </p>
              <div className="badge badge-outline">3-4 minutes</div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-base-content/75">
              Use the prompt to practice speaking aloud or record your answers externally, then review fluency, vocabulary, and coherence.
            </p>
            <button className="btn btn-primary mt-6">Start Speaking Test</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speaking;
