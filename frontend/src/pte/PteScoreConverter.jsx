import { useState } from "react";
import { motion } from "framer-motion";

export default function PteScoreConverter() {
  const [pteScore, setPteScore] = useState(65);

  // Get IELTS score and level description based on PTE score
  const getEquivalent = (p) => {
    if (p >= 86) return { ielts: "9.0", level: "Expert", color: "bg-emerald-50 text-emerald-700 border-emerald-100", desc: "Perfect command of the English language. Suitable for any high-level academic or professional placement globally." };
    if (p >= 83) return { ielts: "8.5", level: "Very Good", color: "bg-emerald-50 text-emerald-700 border-emerald-100", desc: "Excellent capability. Ideal for complex research roles and prestigious Ivy League universities." };
    if (p >= 79) return { ielts: "8.0", level: "Very Good", color: "bg-emerald-50 text-emerald-700 border-emerald-100", desc: "Highly fluent. Exceeds admissions requirements for almost all top-tier international universities." };
    if (p >= 73) return { ielts: "7.5", level: "Good", color: "bg-green-50 text-green-700 border-green-100", desc: "Effective operational capability. Matches requirement for competitive postgraduate courses." };
    if (p >= 65) return { ielts: "7.0", level: "Good", color: "bg-green-50 text-green-700 border-green-100", desc: "Generally effective command. Standard requirement for undergraduate and general professional visa entries." };
    if (p >= 58) return { ielts: "6.5", level: "Competent", color: "bg-amber-50 text-amber-700 border-amber-100", desc: "Competent command. Fits entry requirements for most standard international programs." };
    if (p >= 50) return { ielts: "6.0", level: "Competent", color: "bg-amber-50 text-amber-700 border-amber-100", desc: "Basic operational command. Acceptable for general study tracks and technical qualifications." };
    if (p >= 43) return { ielts: "5.5", level: "Modest", color: "bg-slate-100 text-slate-700 border-slate-200", desc: "Partial command. May require preparatory foundation programs or English courses." };
    if (p >= 36) return { ielts: "5.0", level: "Modest", color: "bg-slate-100 text-slate-700 border-slate-200", desc: "Limited proficiency. Likely requires intensive pre-sessional English courses." };
    return { ielts: "Under 5.0", level: "Beginner", color: "bg-gray-100 text-gray-500 border-gray-200", desc: "Requires significant foundation work to reach intermediate level proficiency." };
  };

  const { ielts, level, color, desc } = getEquivalent(pteScore);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E30613] bg-red-50 border border-red-100 rounded-full mb-4"
          >
            Score Calculator
          </motion.span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#000f38] tracking-tight mb-4">
            Interactive PTE to IELTS Score Converter
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Drag the slider to calculate how your target PTE Academic overall score aligns with equivalent IELTS bands.
          </p>
        </div>

        {/* Interactive Slider Widget Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-slate-50 border border-slate-200/80 rounded-[3rem] p-6 sm:p-12 shadow-xl flex flex-col md:flex-row gap-8 items-center"
        >
          {/* Left panel: Slider control */}
          <div className="w-full md:w-3/5 space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Target PTE Score</span>
              <span className="text-4xl font-black text-[#E30613] bg-red-50 border border-red-100/50 px-4 py-1.5 rounded-2xl">{pteScore}</span>
            </div>

            <div className="relative pt-4">
              <input
                type="range"
                min="10"
                max="90"
                value={pteScore}
                onChange={(e) => setPteScore(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E30613]"
              />
              <div className="flex justify-between text-xs text-slate-400 font-bold mt-3 px-1">
                <span>Min: 10</span>
                <span>50</span>
                <span>65</span>
                <span>79</span>
                <span>Max: 90</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assessment Details</p>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">{desc}</p>
            </div>
          </div>

          {/* Divider line for md and up */}
          <div className="hidden md:block w-px h-48 bg-slate-200" />

          {/* Right panel: Output equivalency */}
          <div className="w-full md:w-2/5 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">IELTS Band Equivalent</span>
            <motion.div
              key={ielts}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="text-6xl sm:text-7xl font-black text-[#000f38] leading-none"
            >
              {ielts}
            </motion.div>

            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${color}`}>
              {level} Level
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
