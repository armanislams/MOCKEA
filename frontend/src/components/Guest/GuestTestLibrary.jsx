import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import useAxios from "../../hooks/useAxios";
import { motion } from "framer-motion";
import { FaMicrophone, FaHeadphones, FaArrowRight } from "react-icons/fa6";

export default function GuestTestLibrary() {
  const axiosPublic = useAxios();

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["public-mock-tests"],
    queryFn: async () => {
      const res = await axiosPublic.get("/public-mock-tests");
      return res.data.tests ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <main className="min-h-screen bg-base-200 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 text-cta-btn pb-2"
          >
            Free Practice Mock Tests
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-base-content/70 max-w-2xl mx-auto"
          >
            Elevate your skills with our premium mock test collection. Select a test below to begin your free practice session.
          </motion.p>
        </div>

        {tests.length === 0 ? (
          <p className="text-center text-lg text-base-content/60 mt-12">No public tests available at the moment. Please check back later.</p>
        ) : (
          <motion.div 
            variants={{
              show: {
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tests.map(test => (
              <motion.div 
                key={test._id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-base-100 border border-base-200/80 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Decorative top gradient bar */}
                <div className={`h-1.5 w-full ${test.testType === 'speaking' ? 'bg-cta-btn' : 'bg-primary'}`}></div>
                
                {/* Subtle Glow effect on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none ${test.testType === 'speaking' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                <div className="p-8 grow flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl shadow-sm ${test.testType === 'speaking' ? 'bg-cta-btn text-white dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-primary text-white dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {test.testType === 'speaking' ? <FaMicrophone className="text-2xl" /> : <FaHeadphones className="text-2xl" />}
                    </div>
                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest ${test.testType === 'speaking' ? 'bg-cta-btn text-white dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-primary text-white dark:bg-blue-900/50 dark:text-blue-300'}`}>
                      {test.testType}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-base-content mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {test.title}
                  </h2>
                  <p className="text-base-content/70 grow line-clamp-3 mb-8 leading-relaxed">
                    {test.instructions || "Ready to improve your skills? Start this practice test and get immediate feedback."}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/free-practice/tests/${test._id}`} 
                      className={`w-full btn border-none rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden text-white ${test.testType === 'speaking' ? 'bg-cta-btn' : 'bg-primary'}`}
                    >
                      <span className="relative z-10">Start Test</span>
                      <FaArrowRight className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
