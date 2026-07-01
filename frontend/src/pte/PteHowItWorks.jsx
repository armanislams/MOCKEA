import { FaBook } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    icon: MdLogin,
    title: "Register & Login",
    desc: "Create your Mockea account in just a few seconds and gain access to the full practice suite.",
    badgeColor: "bg-red-50 text-[#E30613] border-red-100",
    iconColor: "text-[#E30613]"
  },
  {
    num: "02",
    icon: FaBook,
    title: "Practice PTE Layouts",
    desc: "Focus on specific PTE question types (e.g. Write From Dictation, Fill in the Blanks) inside an exact Pearson interface clone.",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    num: "03",
    icon: IoAnalytics,
    title: "AI Scoring (10-90)",
    desc: "Submit your answers and get instantaneous diagnostic score updates mapped directly to Pearson global scoring standards.",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    iconColor: "text-amber-600"
  }
];

export const PteHowItWorks = () => {
  return (
    <div className="rounded-[3rem] bg-white py-16 px-6 sm:px-12 border border-gray-100 shadow-md">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
          Simple Stepper
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-gray-500 font-medium">
          Start your preparation journey with Mockea in three simple, streamlined steps.
        </p>
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="relative max-w-3xl mx-auto">
        {/* Central connecting line */}
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#E30613] via-emerald-500 to-amber-500 hidden sm:block" />

        <div className="space-y-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative flex flex-col sm:flex-row items-start gap-6 sm:gap-12"
              >
                {/* Step badge/indicator */}
                <div className="flex items-center justify-center shrink-0 z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${step.badgeColor} text-2xl font-black bg-white`}>
                    <Icon size={26} />
                  </div>
                </div>

                {/* Step Content Card */}
                <div className="grow bg-slate-50 hover:bg-slate-100/70 p-6 rounded-2xl border border-slate-100 transition-all duration-300 relative group">
                  <span className="absolute top-4 right-6 text-4xl font-black text-gray-200/60 select-none group-hover:text-gray-300/80 transition-colors">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-gray-950 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PteHowItWorks;
