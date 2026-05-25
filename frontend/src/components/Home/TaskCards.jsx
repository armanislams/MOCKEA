import { forwardRef } from "react";
import { FaChartLine, FaCommentDots, FaMedal, FaRegLightbulb } from "react-icons/fa";
import FlipCard from "../Common/FlipCard";

// ─── Card data ────────────────────────────────────────────────────────────────

const cards = [
  {
    icon: FaChartLine,
    title: "Instant Feedback",
    description: "Get immediate results and explanations after each practice test.",
  },
  {
    icon: FaRegLightbulb,
    title: "Skill Building",
    description: "Improve listening, reading, writing and speaking with focused modules.",
  },
  {
    icon: FaMedal,
    title: "Performance Tracking",
    description: "Monitor your progress with clear analytics and improvement suggestions.",
  },
  {
    icon: FaCommentDots,
    title: "Expert Guidance",
    description: "Access tips, resources, and task-specific support to refine your exam skills.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const TaskCards = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <FlipCard
            key={card.title}
            height="260px"
            duration="0.7s"
            /* ── Front ── */
            frontClass="bg-white border border-slate-200 flex flex-col items-center justify-center gap-5 p-8"
            front={
              <>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-primary shadow-inner">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight text-center">
                  {card.title}
                </h3>
              </>
            }
            /* ── Back ── */
            backClass="bg-cta-btn text-white flex flex-col items-center justify-center text-center p-8"
            back={
              <>
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-black mb-2 tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="text-white/90 text-sm font-semibold leading-relaxed">
                  {card.description}
                </p>
              </>
            }
          />
        );
      })}
    </div>
  );
});

TaskCards.displayName = "TaskCards";