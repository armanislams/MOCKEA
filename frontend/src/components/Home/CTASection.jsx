import { forwardRef } from "react";
import { Link } from "react-router";
import FlipCard from "../Common/FlipCard";

// ─── Card data ────────────────────────────────────────────────────────────────

const ctaItems = [
  {
    title: "Listening",
    icon: "/listening-icon.png",
    to: "/dashboard/listening",
  },
  {
    title: "Reading",
    icon: "/book-icon.png",
    to: "/dashboard/reading",
  },
  {
    title: "Writing",
    icon: "/writing-icon.png",
    to: "/dashboard/writing",
  },
  {
    title: "Speaking",
    icon: "/speaking-icon.png",
    to: "/dashboard/speaking",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CTASection = forwardRef((props, ref) => {
  return (
    <section id="testFormats" className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            Choose a module
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
            Start your IELTS practice with a single click
          </h2>
        </div>

        {/* Cards grid */}
        <div
          ref={ref}
          className="mx-auto grid max-w-lg grid-cols-2 gap-4 sm:max-w-xl sm:gap-6"
        >
          {ctaItems.map((item) => (
            <FlipCard
              key={item.title}
              as={Link}
              to={item.to}
              height="180px"
              duration="0.65s"
              radius="1.5rem"
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              /* ── Front ── */
              frontClass="bg-cta-btn flex flex-col items-center justify-center gap-3 p-5"
              //red-800 previous color
              front={
                <>
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-20 h-20 sm:w-50 sm:h-40 object-contain brightness-0 invert"
                    aria-hidden
                  />
                </>
              }
              /* ── Back ── */
              backClass="bg-white flex flex-col items-center justify-center gap-2 p-5 text-center border-4 border-cta-btn"
              back={
                <>
                  <span className="text-4xl font-black tracking-tight text-slate-900 uppercase">
                    {item.title}
                  </span>
                </>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
