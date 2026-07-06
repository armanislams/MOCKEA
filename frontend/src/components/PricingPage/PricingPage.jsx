import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiShield, FiRotateCcw, FiLock } from 'react-icons/fi';
import { Pricing } from '../Home/Pricing';
import { useLocation } from 'react-router';

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const location = useLocation();
  const isPte = (localStorage.getItem("temp_exam") || localStorage.getItem("prefetched_exam")) === "PTE";

  const FAQS = [
    {
      q: "Is there a free tier available?",
      qPte: "Is there a free tier available?",
      a: "Yes! Our Free tier allows you to access basic mock tests, section-wise practice tests, and standard downloadable resource PDFs without ever entering a credit card.",
      aPte: "Yes! Our Free tier allows you to access basic mock tests, section-wise practice tests, and standard downloadable resource PDFs without ever entering a credit card."
    },
    {
      q: "How accurate is the AI evaluation system?",
      a: "Our advanced AI scoring engine is trained and calibrated against tens of thousands of officially graded IELTS mock exams. It achieves a 98% scoring correlation with official human examiners across writing and speaking rubrics.",
      aPte: "Our advanced AI scoring engine is trained and calibrated against Pearson global scoring benchmarks. It achieves a 98% scoring correlation with official examiners across enabling and communicative skills."
    },
    {
      q: "Can I request a refund if MOCKEA isn't for me?",
      a: "Absolutely! We stand by the quality of MOCKEA. If you are not satisfied with your experience, we offer a 100% money-back guarantee within the first 7 days of subscription.",
      aPte: "Absolutely! We stand by the quality of MOCKEA. If you are not satisfied with your experience, we offer a 100% money-back guarantee within the first 7 days of subscription."
    },
    {
      q: "Are the questions up to date with the latest format?",
      a: "Yes. All MOCKEA mock tests, writing prompts, and speaking cue cards are continuously reviewed and updated by certified IELTS tutors to match the exact guidelines and difficulty of the current year's exams.",
      aPte: "Yes. All MOCKEA mock tests and module layouts are continuously reviewed and updated by certified PTE training experts to match the exact Pearson guidelines and difficulty levels."
    },
    {
      q: "Can I upgrade, downgrade, or cancel my plan?",
      a: "Yes, you can change or cancel your subscription plan at any time directly through the Billing and Plan Settings on your Student Dashboard. There are no cancellation fees or hidden commitments.",
      aPte: "Yes, you can change or cancel your subscription plan at any time directly through the Billing and Plan Settings on your Student Dashboard. There are no cancellation fees or hidden commitments."
    }
  ];

  const COMPARISON_FEATURES = [
    { name: "Full-Length Mock Tests", free: "1 Test", essential: "5 Tests / Month", elite: "Unlimited" },
    { name: "Section Practice Tests", free: "Basic Tests", essential: "All Standard Tests", elite: "VIP Diagnostic Tests" },
    { name: isPte ? "Instant AI Score prediction (10-90)" : "Instant AI Score Prediction (0-9)", free: isPte ? "Score range" : "Band Range", essential: "Detailed Analytics", elite: "Deep Diagnostic Reports" },
    { name: "Certified Instructor Reviews", free: "✘", essential: "2 Reviews / Month", elite: "Unlimited Priority Reviews" },
    { name: "Premium Study Resources", free: "Standard PDFs", essential: "Full E-Book Library", elite: "VIP Custom Study Plans" },
    { name: "Support Channels", free: "Community Forum", essential: "24h Email Support", elite: "24/7 Priority Live Chat" },
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Decorative background blobs */}
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full filter blur-3xl -z-10 ${isPte ? "bg-blue-100/20" : "bg-blue-200/30"}`} />
        <div className={`absolute top-60 -right-40 w-96 h-96 rounded-full filter blur-3xl -z-10 ${isPte ? "bg-teal-100/10" : "bg-red-200/20"}`} />

        {/* 1. Reuse existing Pricing plans display component */}
        <div className="mb-16">
          <Pricing />
        </div>

        {/* 2. Features Comparison Matrix */}
        <div className="mb-24 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#000f38]">Compare Plans in Detail</h2>
            <p className="text-slate-500 mt-2">See exactly what you get inside every tier.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-6 text-sm font-bold text-slate-800">Features</th>
                    <th className="p-6 text-sm font-bold text-slate-800 text-center">Free Practice</th>
                    <th className="p-6 text-sm font-bold text-slate-800 text-center">Essential Prep</th>
                    <th className={`p-6 text-sm font-bold text-slate-800 text-center ${isPte ? "bg-blue-50/50" : "bg-red-50/20"}`}>Elite Success</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {COMPARISON_FEATURES.map((feature, fIdx) => (
                    <tr key={fIdx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-semibold text-slate-900 text-sm">{feature.name}</td>
                      <td className="p-6 text-center text-sm text-slate-500">{feature.free}</td>
                      <td className="p-6 text-center text-sm text-slate-800 font-medium">{feature.essential}</td>
                      <td className={`p-6 text-center text-sm font-black ${isPte ? "text-blue-600 bg-blue-50/20" : "text-[#000f38] bg-red-50/10"}`}>{feature.elite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Trust Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 px-8 py-10 md:px-12 md:py-12 shadow-md max-w-5xl mx-auto mb-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-2xl ${isPte ? "bg-blue-50 text-blue-600" : "bg-red-50 text-cta-btn"}`}>
              <FiRotateCcw className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">7-Day Guarantee</h3>
            <p className="text-sm text-slate-500">Not satisfied? Drop us a mail within 7 days, and get a complete refund. No questions asked.</p>
          </div>
          <div className="flex flex-col items-center gap-3 border-y border-slate-100 py-6 md:py-0 md:border-y-0 md:border-x">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
              <FiShield className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Fully Encrypted</h3>
            <p className="text-sm text-slate-500">Industry-leading SSL encryption ensures your financial info and data remain 100% secure.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-2xl ${isPte ? "bg-blue-50 text-blue-600" : "bg-blue-50 text-blue-600"}`}>
              <FiLock className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Cancel Anytime</h3>
            <p className="text-sm text-slate-500">No locked-in contracts. Upgrade, downgrade, or stop your auto-renewal whenever you like.</p>
          </div>
        </div>

        {/* 4. FAQs Accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#000f38]">Frequently Asked Questions</h2>
            <p className="text-slate-500 mt-2">Have a question? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const answer = isPte ? (faq.aPte || faq.a) : faq.a;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-6 text-left font-bold text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <span className="p-1 bg-slate-50 rounded-lg text-slate-500">
                      {isOpen ? <FiMinus className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-6 pt-0 border-t border-slate-100 text-slate-600 text-sm leading-relaxed">
                          {answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
