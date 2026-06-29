import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiZap } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../../../hooks/useAxios';
import Loader from '../../Loader/Loader';
import Error from '../../Common/Error';

const PricingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto py-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200/60 rounded-[2.25rem] p-10 flex flex-col justify-between h-[480px] animate-pulse">
          <div className="space-y-6">
            <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
            <div className="h-8 w-40 bg-slate-300 rounded-lg"></div>
            <div className="h-12 w-28 bg-slate-200 rounded-lg mt-4"></div>
            <div className="space-y-3 pt-6">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="h-4 w-full bg-slate-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-12 w-full bg-slate-300 rounded-2xl"></div>
        </div>
      ))}
    </div>
  );
};

export const PtePricing = () => {
  const axiosPublic = useAxios();

  const { data: pricingPlans = [], isLoading, isError } = useQuery({
    queryKey: ['pricing'],
    queryFn: async () => {
      const res = await axiosPublic.get('/pricing');
      return res.data.pricing;
    }
  });

  if (isLoading) return <PricingSkeleton />;
  if (isError) return <Error />;

  // Filter PTE plans if any exist, otherwise use all plans but display with blue branding
  const ptePlans = pricingPlans.filter(p => p.category?.toLowerCase() === 'pte').length > 0
    ? pricingPlans.filter(p => p.category?.toLowerCase() === 'pte')
    : pricingPlans;

  return (
    <section id="pricing" className="relative bg-white rounded-4xl px-4 py-10 md:px-8 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full filter blur-3xl -z-10" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="flex flex-col items-center gap-2 mb-4">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded-full"
            >
              <FiZap className="w-3.5 h-3.5 fill-current animate-pulse text-blue-600" />
              PTE Pricing & Plans
            </motion.span>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000f38] tracking-tight mb-4"
          >
            Choose the Perfect PTE Prep Plan
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 leading-relaxed"
          >
            Unlock professional PTE Academic mock exams, detailed enabling skills analyses, and direct feedback customized to hit your target score.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {ptePlans.map((plan, idx) => {
            const isPopular = idx === 1; // Mark second card as popular
            return (
              <motion.div
                key={plan._id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between p-8 rounded-[2.25rem] border transition-all duration-300 hover:shadow-xl ${
                  isPopular 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                    : "bg-slate-50 text-slate-800 border-slate-200/60"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase tracking-widest rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-2">{plan.title}</h3>
                  <div className="flex items-baseline gap-1.5 my-6">
                    <span className="text-4xl font-black tracking-tight">${plan.price}</span>
                    <span className={`text-xs font-semibold ${isPopular ? "text-white/70" : "text-slate-500"}`}>/ pack</span>
                  </div>
                  <ul className="space-y-4 pt-4 border-t border-dashed border-current/20">
                    {plan.features?.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <FiCheck className={`w-5 h-5 shrink-0 ${isPopular ? "text-amber-300" : "text-blue-600"}`} />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={`w-full mt-8 py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  isPopular 
                    ? "bg-white text-blue-600 hover:bg-blue-50" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
                }`}>
                  Get Started <FiArrowRight />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
