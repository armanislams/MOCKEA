import { Link } from 'react-router';

const sectionTests = [
  {
    title: 'Listening Test',
    description: 'Academic lectures and everyday conversations with time-based listening questions.',
    tags: ['Academic', 'General'],
    duration: '30 min',
    questions: '40 questions',
    band: '6.5-7.0',
    to: '/dashboard/listening',
  },
  {
    title: 'Reading Test',
    description: 'Passages covering science, technology, and social topics with comprehension checks.',
    tags: ['Academic', 'Science'],
    duration: '60 min',
    questions: '40 questions',
    band: '7.0-8.0',
    to: '/dashboard/reading',
  },
  {
    title: 'Writing Test',
    description: 'Task 1 and Task 2 prompts for essay structure, coherence, and vocabulary practice.',
    tags: ['Academic', 'Practice'],
    duration: '60 min',
    questions: '2 tasks',
    band: '6.0-7.5',
    to: '/dashboard/writing',
  },
  {
    title: 'Speaking Test',
    description: 'Cue cards, part 1 questions, and follow-up prompts to build fluency and confidence.',
    tags: ['Speaking', 'Fluency'],
    duration: '15 min',
    questions: '3 parts',
    band: '6.5-7.5',
    to: '/dashboard/speaking',
  },
];

const TakeTest = () => {
  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="rounded-3xl bg-white border border-base-300 p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-2">Take a Test</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Choose a section to begin your practice.</h1>
          <p className="mt-4 text-base-content/75 max-w-3xl">
            Select one of the IELTS section tests below and jump straight into targeted practice for listening, reading, writing, or speaking.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-2">
          {sectionTests.map((test) => (
            <article key={test.title} className="rounded-3xl border border-base-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-semibold">{test.title}</h2>
                  <p className="mt-3 text-base-content/75">{test.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {test.tags.map((tag) => (
                    <span key={tag} className="badge badge-outline badge-sm">{tag}</span>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-sm text-base-content/70">
                  <div className="rounded-2xl bg-base-200 p-4">
                    <p className="font-semibold">Duration</p>
                    <p className="mt-1">{test.duration}</p>
                  </div>
                  <div className="rounded-2xl bg-base-200 p-4">
                    <p className="font-semibold">Questions</p>
                    <p className="mt-1">{test.questions}</p>
                  </div>
                  <div className="rounded-2xl bg-base-200 p-4">
                    <p className="font-semibold">Estimated band</p>
                    <p className="mt-1">{test.band}</p>
                  </div>
                </div>

                <div>
                  <Link to={test.to} className="btn btn-primary w-full sm:w-auto">
                    Start test
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TakeTest;
