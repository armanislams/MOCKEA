import { Link } from 'react-router';
import { forwardRef } from 'react';



const ctaItems = [
  {
    title: "Listening",
    icon: "/listening-icon.png",
    to: "/dashboard/listening",
    tooltip:
      "Click to begin Listening practice with authentic IELTS-style audio.",
  },
  {
    title: "Reading",
    icon: "/book-icon.png",
    to: "/dashboard/reading",
    tooltip: "Click to begin Reading practice with timed exam passages.",
  },
  {
    title: "Writing",
    icon: "/writing-icon.png",
    to: "/dashboard/writing",
    tooltip: "Click to begin Writing practice with instant feedback.",
  },
  {
    title: "Speaking",
    icon: "/speaking-icon.png",
    to: "/dashboard/speaking",
    tooltip: "Click to begin Speaking evaluation (requires login)",
  },
];

//choose module section

const CTASection = forwardRef((props, ref) => {
  return (
    <section id='testFormats' className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            Choose a module
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Start your IELTS practice with a single click
          </h2>
          
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
                className="group relative flex min-h-[140px] md:min-h-[180px] flex-col items-center justify-center rounded-xl border-4 border-transparent bg-red-800 px-5 py-8 text-center transition-[border-color,background-color] focus-visible:outline-none hover:bg-white hover:border-blue-800 hover:border-4 "
              >
                <div className="relative mb-4 flex shrink-0 flex-col items-center">
                  <span
                    id={tooltipId}
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 rounded-md border border-white/10 bg-bc-navy px-3 py-2 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 md:block group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    {item.tooltip}
                  </span>
                  
                  
                    <img 
                      src={Icon} 
                      alt={item.title} 
                      className="w-28 h-28 sm:w-30 sm:h-30 object-contain transition-all duration-300 filter brightness-0 invert group-hover:scale-110 group-hover:filter-none" 
                      aria-hidden 
                    />
                 
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-white sm:text-base group-hover:text-black transition-colors duration-300">
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
