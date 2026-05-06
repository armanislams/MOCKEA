import { Link } from 'react-router';
import useAuth from '../../../hooks/useAuth';

const features = [
  {
    title: 'Listening practice tests',
    description:
      'Work through realistic audio passages with playback controls tailored for exam-style listening.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Timed sessions',
    description:
      'A built-in elapsed timer helps you practise pacing—the same discipline you need on test day.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Submit answers to your profile',
    description:
      'When you are ready, send your transcription to your account so you can review growth over time.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const steps = [
  { step: '1', title: 'Open practice', detail: 'Start a listening session from the dashboard.' },
  { step: '2', title: 'Listen & transcribe', detail: 'Play, pause, and type what you hear in the workspace.' },
  { step: '3', title: 'Submit when ready', detail: 'Send your answer to save it alongside your progress.' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const name = user?.displayName || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-10">
      <div className="hero rounded-2xl bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="hero-content flex-col lg:flex-row gap-8 py-10 px-6 lg:px-12 w-full max-w-none items-start lg:items-center">
          <div className="max-w-xl text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Welcome back, {name}
            </h1>
            <p className="py-4 text-base-content/80">
              This is your hub for EcoStream listening practice. Run a test-style session, keep your notes in one
              place, and build the habits you need before the real exam.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard/practice" className="btn btn-primary">
                Start a listening test
              </Link>
              <Link to="/" className="btn btn-outline btn-neutral">
                Back to site home
              </Link>
            </div>
          </div>
          <div className="card bg-primary/10 border border-primary/20 w-full max-w-md shrink-0">
            <div className="card-body">
              <h2 className="card-title text-lg">Quick start</h2>
              <p className="text-sm text-base-content/80">
                The practice room includes audio controls, a large writing area, word count, and submit to your
                profile—everything for a focused run.
              </p>
              <div className="card-actions justify-end mt-2">
                <Link to="/dashboard/practice" className="btn btn-sm btn-primary">
                  Go to practice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat place-items-center place-content-center py-6">
            <div className="stat-title text-center">Practice mode</div>
            <div className="stat-value text-primary text-2xl">Listening</div>
            <div className="stat-desc text-center">Audio + transcript</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat place-items-center place-content-center py-6">
            <div className="stat-title text-center">Controls</div>
            <div className="stat-value text-2xl">Play / pause</div>
            <div className="stat-desc text-center">Scrub & mute</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat place-items-center place-content-center py-6">
            <div className="stat-title text-center">Workspace</div>
            <div className="stat-value text-2xl">Draft + save</div>
            <div className="stat-desc text-center">Before you submit</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100 border border-base-300">
          <div className="stat place-items-center place-content-center py-6">
            <div className="stat-title text-center">Goal</div>
            <div className="stat-value text-2xl">Test ready</div>
            <div className="stat-desc text-center">Consistent runs</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">What you can do here</h2>
            <p className="text-base-content/70 mt-1 max-w-2xl">
              The dashboard is built around one core flow: realistic listening practice with feedback you can act on.
            </p>
          </div>
          <Link to="/dashboard/practice" className="btn btn-primary btn-outline sm:shrink-0">
            Take a test now
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <div className="text-primary mb-2">{f.icon}</div>
                <h3 className="card-title text-lg">{f.title}</h3>
                <p className="text-base-content/80">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-2xl">How a session works</h2>
          <p className="text-base-content/70 max-w-2xl">
            Three simple steps—stay in flow and treat each run like a mini exam.
          </p>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {steps.map((s) => (
              <div key={s.step} className="rounded-xl bg-base-200/80 border border-base-300 p-4">
                <div className="badge badge-primary badge-outline mb-2">Step {s.step}</div>
                <h3 className="font-bold text-lg">{s.title}</h3>
                <p className="text-sm text-base-content/70 mt-1">{s.detail}</p>
              </div>
            ))}
          </div>
          <div className="card-actions justify-end mt-6">
            <Link to="/dashboard/practice" className="btn btn-primary">
              Start listening test
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
