import { forwardRef } from "react";
import { FaChartLine, FaCommentDots, FaMedal, FaRegLightbulb } from "react-icons/fa";
import FlipCard from "../../Common/FlipCard";

const cards = [
  {
    icon: FaChartLine,
    title: "Instant AI Scoring",
    description: "Get immediate PTE-equivalent score cards (10-90) and diagnostic report after each practice session.",
  },
  {
    icon: FaRegLightbulb,
    title: "PTE Target Modules",
    description: "Practice Repeat Sentence, Describe Image, and Write Essay with real-time feedback.",
  },
  {
    icon: FaMedal,
    title: "Detailed Analytics",
    description: "Track your communicative skills (Listening, Reading, Speaking, Writing) and enabling skills progress.",
  },
  {
    icon: FaCommentDots,
    title: "Expert Tips",
    description: "Access PTE-specific templates, quick strategies, and exam-day mock simulations.",
  },
];

export const PteTaskCards = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <FlipCard
            key={card.title}
            height="260px"
            duration="0.7s"
            frontClass="bg-white border border-slate-200 flex flex-col items-center justify-center gap-5 p-8"
            front={
              <>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight text-center">
                  {card.title}
                </h3>
              </>
            }
            backClass="bg-blue-600 text-white flex flex-col items-center justify-center text-center p-8"
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

PteTaskCards.displayName = "PteTaskCards";
