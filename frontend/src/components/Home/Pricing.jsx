import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiStar, FiZap } from 'react-icons/fi';

import { useQuery } from '@tanstack/react-query';
import useAxios from '../../hooks/useAxios';
import Loader from '../Loader/Loader';
import Error from '../Common/Error';

export const Pricing = () => {
  const axiosPublic = useAxios();

  const { data: pricingPlans = [], isLoading, isError } = useQuery({
    queryKey: ['pricing'],
    queryFn: async () => {
      const res = await axiosPublic.get('/pricing');
      return res.data.pricing;
    }
  });

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

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

        {/* CSS Style Injection for 3D Pricing Flip Cards */}
        <style>{`
          .pricing-flip-card {
            perspective: 1000px;
            height: 480px;
            background-color: transparent;
          }
          .pricing-flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
          }
          .pricing-flip-card:hover .pricing-flip-card-inner {
            transform: rotateY(180deg);
          }
          .pricing-flip-card-front, .pricing-flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            border-radius: 2.25rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 2.5rem;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
          }
          .pricing-flip-card-front {
            border: 1px solid #e2e8f0;
          }
          .pricing-flip-card-back {
            transform: rotateY(180deg);
          }
        `}</style>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.priceId}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="pricing-flip-card"
            >
              <div className="pricing-flip-card-inner">
                
                {/* 1. FRONT SIDE */}
                {plan.isPopular ? (
                  /* FRONT: Popular Card (Fully Detailed / Red) */
                  <div className="pricing-flip-card-front bg-cta-btn text-white border-transparent shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full filter blur-md -mr-6 -mt-6" />
                    
                    <div className="absolute top-6 right-6 px-3.5 py-1.5 bg-white text-cta-btn text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 z-20">
                      <FiStar className="w-3.5 h-3.5 fill-current animate-pulse text-cta-btn" />
                      Most Popular
                    </div>

                    <div>
                      <div className="border-b border-white/10 pb-6">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md bg-white/95 text-black">
                          {plan.subtitle}
                        </span>
                        <h3 className="text-2xl font-black mt-4 text-white">{plan.name}</h3>
                        <div className="mt-5 flex items-baseline gap-1.5">
                          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                            {plan.price}
                          </span>
                          <span className="text-xs font-medium text-white/85">
                            / {plan.duration}
                          </span>
                        </div>
                      </div>

                      {/* Features - Shown by default! */}
                      <div className="py-6">
                        <ul className="space-y-3.5">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-left">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-green-500/20 text-green-400">
                                <FiCheck className="w-3 h-3 stroke-3" />
                              </span>
                              <span className="text-sm font-bold text-white/90">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-center text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">
                        <span className="hidden md:inline">Hover for Exclusive Perks ➜</span>
                        <span className="md:hidden">Click for Exclusive Perks ➜</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* FRONT: Standard Card (Name & Price Only / White) */
                  <div className="pricing-flip-card-front bg-white text-slate-900 border-slate-200 shadow-md">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md bg-slate-100 text-slate-500">
                        {plan.subtitle}
                      </span>
                      <h3 className="text-2xl font-black mt-4 text-slate-900">{plan.name}</h3>
                      <div className="mt-5 flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
                          {plan.price}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          / {plan.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-3xl bg-blue-50 text-primary flex items-center justify-center text-4xl shadow-inner">
                        {index === 0 ? <FiZap /> : <FiCheck />}
                      </div>
                    </div>

                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                      <span className="hidden md:inline">Hover to view details ➜</span>
                      <span className="md:hidden">Click to see details ➜</span>
                    </div>
                  </div>
                )}

                {/* 2. BACK SIDE (FLIPPED) */}
                {plan.isPopular ? (
                  /* BACK: Popular Card (VIP Perks / Midnight Blue) */
                  <div className="pricing-flip-card-back bg-primary text-white border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-500/5 rounded-full filter blur-md -mr-6 -mb-6" />

                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                        <h4 className="text-lg font-black tracking-tight text-white">
                          VIP Premium Perks
                        </h4>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-cta-btn text-white px-2 py-0.5 rounded">
                          Elite Status
                        </span>
                      </div>
                      
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3.5 text-left">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
                            ★
                          </span>
                          <div>
                            <span className="text-sm font-black text-white">1-on-1 Trainer Review</span>
                            <p className="text-xs text-white/60 mt-0.5 leading-relaxed">Direct oral & essay evaluations by native IELTS examiners.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3.5 text-left">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
                            ★
                          </span>
                          <div>
                            <span className="text-sm font-black text-white">Priority AI Support Queue</span>
                            <p className="text-xs text-white/60 mt-0.5 leading-relaxed">Instant, unlimited prioritised feedback for all Writing/Speaking tests.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3.5 text-left">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
                            ★
                          </span>
                          <div>
                            <span className="text-sm font-black text-white">Full Security Audit Logs</span>
                            <p className="text-xs text-white/60 mt-0.5 leading-relaxed">Official, comprehensive anti-cheat tracking reports for score auditing.</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button className="w-full group py-4 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-cta-btn border border-transparent text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:bg-red-600 transition-all">
                        <span>Get Elite Access</span>
                        <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BACK: Standard Card (Brand Red / Features List) */
                  <div className="pricing-flip-card-back bg-cta-btn text-white flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-lg font-black tracking-tight border-b border-white/10 pb-4 mb-5 text-white">
                        {plan.name} Features
                      </h4>
                      
                      <ul className="space-y-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-left">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-white/20 text-white">
                              <FiCheck className="w-3 h-3 stroke-3" />
                            </span>
                            <span className="text-sm font-bold text-white">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button className="w-full group py-4 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-white text-slate-900 hover:bg-slate-50 hover:scale-[1.02] active:scale-98 transition-all">
                        <span>{plan.CtaBtn}</span>
                        <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};