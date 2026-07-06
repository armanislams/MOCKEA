import { motion } from "framer-motion";
import { PiBookOpenFill, PiHeadphonesFill, PiCheckCircleFill } from "react-icons/pi";
import { RiMicFill } from "react-icons/ri";
import { useNavigate } from "react-router";

const modules = [
  {
    icon: RiMicFill,
    title: "Speaking & Writing",
    duration: "54 - 67 minutes",
    color: "from-red-500 to-[#E30613]",
    lightColor: "bg-red-50 text-[#E30613] border-red-100",
    tasks: [
      "Read Aloud & Repeat Sentence",
      "Describe Image & Retell Lecture",
      "Summarize Written Text",
      "Write Essay (200-300 words)"
    ]
  },
  {
    icon: PiBookOpenFill,
    title: "Reading",
    duration: "29 - 30 minutes",
    color: "from-blue-500 to-[#0028a2]",
    lightColor: "bg-blue-50 text-[#0028a2] border-blue-100",
    tasks: [
      "Reading & Writing Fill in the Blanks",
      "Multiple Choice, Multiple Answers",
      "Re-order Paragraphs",
      "Reading Fill in the Blanks"
    ]
  },
  {
    icon: PiHeadphonesFill,
    title: "Listening",
    duration: "30 - 43 minutes",
    color: "from-blue-500 to-[#0028a2]",
    lightColor: "bg-blue-50 text-[#0028a2] border-blue-100",
    tasks: [
      "Summarize Spoken Text",
      "Fill in the Blanks & Write From Dictation",
      "Highlight Correct Summary",
      "Highlight Incorrect Words"
    ]
  }
];

export default function PteModules() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-[#FAF9F6] relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-red-100/20 rounded-full filter blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/10 rounded-full filter blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E30613] bg-red-50 border border-red-100 rounded-full mb-4"
          >
            PTE Exam Structure
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000f38] tracking-tight mb-4">
            Master the PTE Academic Modules
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Our platform perfectly replicates Pearson's official exam patterns. Familiarize yourself with the timing and task types of each section.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => navigate("/dashboard")}
                className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-lg flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <div className={`p-4 rounded-2xl ${mod.lightColor} border shadow-inner`}>
                      <Icon size={28} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
                      {mod.duration}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-[#000f38] mb-6 group-hover:text-[#E30613] transition-colors">
                    {mod.title}
                  </h3>
                  
                  <ul className="space-y-4">
                    {mod.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-3">
                        <PiCheckCircleFill className="text-blue-600 text-lg shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold text-slate-600">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <span className="text-xs font-black text-[#E30613] uppercase tracking-widest group-hover:translate-x-1.5 transition-transform">
                    Explore Mock Tests &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
