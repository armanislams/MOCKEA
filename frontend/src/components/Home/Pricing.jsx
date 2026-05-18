import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiStar, FiZap } from 'react-icons/fi';

const pricingPlans = [
  {
    id: "free",
    name: "Free Practice",
    subtitle: "KICKSTART YOUR PREP",
    price: "Free",
    duration: "Unlimited",
    features: [
      "Sample Mock Tests",
      "Instant Band Scores",
      "Basic Dashboard Analytics"
    ],
    isPopular: false,
    secondaryCta: "Start Free Practice",
  },
  {
    id: "standard",
    name: "Standard Prep",
    subtitle: "ACCELERATED PREPARATION",
    price: "$19",
    duration: "30 days",
    features: [
      "Full Assess System (30 days)",
      "2 Live speaking Mock Interviews",
      "Personal Performance Tracker",
      "Core Dashboard Access"
    ],
    isPopular: false,
    secondaryCta: "Unlock Standard Prep",
  },
  {
    id: "premium",
    name: "Elite Premium",
    subtitle: "UNLIMITED SUCCESS",
    price: "$49",
    duration: "90 days",
    features: [
      "Full Assess System (90 days)",
      "5 Live speaking Mock Interviews",
      "Unlimited AI Grading (All Modules)",
      "24/7 Academic Support",
      "Detailed Performance Analytics",
      "Elite Instructor Review Access"
    ],
    isPopular: true,
    secondaryCta: "Go Premium Elite",
  },
];

export const Pricing = () => {
  const [triggerCrash, setTriggerCrash] = useState(false);

  if (triggerCrash) {
    throw new Error("Simulated React Component Crash in Pricing.jsx!");
  }

  return (
    <section id="pricing" className="relative bg-white rounded-4xl px-4 py-10 md:px-8 overflow-hidden font-sans">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full filter blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-100/20 rounded-full filter blur-3xl -z-10" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="flex flex-col items-center gap-2 mb-4">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cta-btn bg-red-50 border border-red-100 rounded-full"
            >
              <FiZap className="w-3.5 h-3.5 fill-current animate-pulse text-cta-btn" />
              Pricing & Plans
            </motion.span>

            {/* Simulated Error triggers for Developer verification */}
            <div className="flex gap-2 justify-center mt-2">
              <button 
                onClick={() => setTriggerCrash(true)}
                className="px-3 py-1 text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-full cursor-pointer transition-all"
              >
                Test UI Crash (ErrorBoundary)
              </button>
              <button 
                onClick={() => {
                  Promise.reject(new Error("Simulated Unhandled Promise Rejection in Pricing page!"));
                }}
                className="px-3 py-1 text-[10px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 rounded-full cursor-pointer transition-all"
              >
                Test Promise Rejection (Global)
              </button>
            </div>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000f38] tracking-tight mb-4"
          >
            Choose the Perfect Prep Plan
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 leading-relaxed"
          >
            Unlock professional IELTS practice exams, interactive speaking mock interviews, and advanced analytic insights custom-tailored to accelerate your score.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ 
                y: -10, 
                scale: 1.015,
                transition: { duration: 0.25, ease: "easeOut" } 
              }}
              className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 ${
                plan.isPopular 
                  ? "bg-gradient-to-b from-[#000f38] to-[#001754] border-cta-btn shadow-xl shadow-blue-950/20 text-white" 
                  : "bg-white border-slate-200 shadow-md shadow-slate-100 text-slate-900"
              }`}
            >
              {/* Popular Badge - Positioned relative to article */}
              {plan.isPopular && (
                <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-cta-btn text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1 z-20">
                  <FiStar className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
                  Most Popular
                </div>
              )}

              {/* Card Body */}
              <div>
                {/* Header Container */}
                <div className={`p-8 pb-6 border-b ${
                  plan.isPopular ? "border-white/10" : "border-slate-100"
                }`}>
                  <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md ${
                    plan.isPopular ? "bg-white/10 text-blue-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {plan.subtitle}
                  </span>
                  
                  <h3 className="text-2xl font-black mt-4">{plan.name}</h3>

                  {/* Pricing Layout */}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      {plan.price}
                    </span>
                    <span className={`text-xs font-medium ${
                      plan.isPopular ? "text-blue-200/80" : "text-slate-500"
                    }`}>
                      / {plan.duration}
                    </span>
                  </div>
                </div>

                {/* Features Container */}
                <div className="p-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                          plan.isPopular ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600"
                        }`}>
                          <FiCheck className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className={`text-sm leading-relaxed ${
                          plan.isPopular ? "text-slate-200 animate-fade-in" : "text-slate-600 animate-fade-in"
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button Container */}
              <div className="p-8 pt-0 mt-auto">
                <button 
                  className={`w-full group py-4 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                    plan.isPopular
                      ? "bg-cta-btn hover:bg-cta-btn/95 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-98"
                      : "bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-cta-btn text-slate-800 hover:text-cta-btn hover:scale-[1.02] active:scale-98"
                  }`}
                >
                  <span>{plan.secondaryCta}</span>
                  <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};