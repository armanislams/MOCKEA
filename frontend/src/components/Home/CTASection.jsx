import { FaBookOpen, FaPencilAlt, FaHeadphones, FaMicrophone } from 'react-icons/fa';
import { Link } from 'react-router';
import { forwardRef } from 'react';

const ctaItems = [
  {
    title: "Listening",
    icon: FaHeadphones,
    to: "/dashboard/listening",
    tooltip:
      "Click to begin Listening practice with authentic IELTS-style audio.",
  },
  {
    title: "Reading",
    icon: FaBookOpen,
    to: "/dashboard/reading",
    tooltip: "Click to begin Reading practice with timed exam passages.",
  },
  {
    title: "Writing",
    icon: FaPencilAlt,
    to: "/dashboard/writing",
    tooltip: "Click to begin Writing practice with instant feedback.",
  },

  {
    title: "Speaking",
    icon: FaMicrophone,
    to: "/dashboard/speaking",
    tooltip: "Click to begin Speaking evaluation (requires login)",
  },
];

const CTASection = forwardRef((props, ref) => {
  return (
    <section className="py-16 bg-bc-light border-b border-gray-200">
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

        <div
          ref={ref}
          className="mx-auto grid max-w-lg grid-cols-2 gap-4 sm:max-w-xl sm:gap-5"
        >
          {ctaItems.map((item) => {
            const Icon = item.icon;
            const tooltipId = `cta-tooltip-${item.title.toLowerCase()}`;
            return (
              <Link
                key={item.title}
                to={item.to}
                aria-describedby={tooltipId}
                className="group relative flex min-h-[140px] flex-col items-center justify-center rounded-xl border-4 border-transparent bg-bc-navy px-3 py-6 text-center transition-[border-color,background-color] hover:border-cta-btn hover:bg-bc-navy-hover focus-visible:outline-none focus-visible:border-cta-btn"
              >
                <div className="relative mb-4 flex shrink-0 flex-col items-center">
                  <span
                    id={tooltipId}
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-[min(17rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-white/10 bg-bc-navy px-3 py-2 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    {item.tooltip}
                  </span>
                  <Icon className="text-white" size={40} aria-hidden />
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-white sm:text-base">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

export default CTASection;
