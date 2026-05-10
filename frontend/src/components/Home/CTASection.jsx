import { FaBookOpen, FaPencilAlt, FaHeadphones, FaMicrophone } from 'react-icons/fa';
import { Link } from 'react-router';

const ctaItems = [
  {
    title: 'Reading',
    description: 'Practice reading with timed exam passages.',
    icon: FaBookOpen,
    to: '/dashboard/reading',
  },
  {
    title: 'Writing',
    description: 'Complete writing tasks with instant feedback.',
    icon: FaPencilAlt,
    to: '/dashboard/writing',
  },
  {
    title: 'Listening',
    description: 'Train your listening with real IELTS audio.',
    icon: FaHeadphones,
    to: '/dashboard/listening',
  },
  {
    title: 'Speaking',
    description: 'Prepare speaking answers and improve fluency.',
    icon: FaMicrophone,
    to: '/dashboard/speaking',
  },
];

const CTASection = () => {
  return (
    <section className="py-16 bg-[#f7fbff] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            Choose a module
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Start your IELTS practice with a single click
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Select any module below. If you are not signed in, you will be asked to log in first and then returned to the module you chose.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ctaItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="group block rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-white transition group-hover:bg-blue-800">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
