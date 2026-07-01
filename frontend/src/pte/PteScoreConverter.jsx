import { motion } from "framer-motion";

const scoreMapping = [
  { pte: "86 - 90", ielts: "9.0", level: "Expert" },
  { pte: "83 - 85", ielts: "8.5", level: "Very Good" },
  { pte: "79 - 82", ielts: "8.0", level: "Very Good" },
  { pte: "73 - 78", ielts: "7.5", level: "Good" },
  { pte: "65 - 72", ielts: "7.0", level: "Good" },
  { pte: "58 - 64", ielts: "6.5", level: "Competent" },
  { pte: "50 - 57", ielts: "6.0", level: "Competent" },
  { pte: "43 - 49", ielts: "5.5", level: "Modest" },
  { pte: "36 - 42", ielts: "5.0", level: "Modest" }
];

export default function PteScoreConverter() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded-full mb-4"
          >
            Score Calculator
          </motion.span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#000f38] tracking-tight mb-4">
            PTE Academic to IELTS Score Converter
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            Understand how your PTE Academic overall scores align with standard IELTS bands.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-slate-200/80 rounded-[2.5rem] overflow-hidden shadow-xs bg-slate-50"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-xs sm:text-sm uppercase tracking-wider font-black">
                <th className="py-5 px-6 sm:px-8">PTE Academic Score</th>
                <th className="py-5 px-6 sm:px-8">IELTS Band Equivalent</th>
                <th className="py-5 px-6 sm:px-8">English Proficiency Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-semibold text-xs sm:text-sm text-slate-700">
              {scoreMapping.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="py-4 px-6 sm:px-8 text-blue-600 font-extrabold">{row.pte}</td>
                  <td className="py-4 px-6 sm:px-8 font-black text-slate-900">{row.ielts}</td>
                  <td className="py-4 px-6 sm:px-8">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      parseFloat(row.ielts) >= 7.5
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : parseFloat(row.ielts) >= 6.0
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
