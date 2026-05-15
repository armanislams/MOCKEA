import { motion } from 'framer-motion';
import {  useNavigate } from 'react-router';
import { FiAlertTriangle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const Error = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-error/5 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full bg-neutral-800/80 backdrop-blur-xl border border-neutral-700/50 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, -5, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-neutral-700 shadow-inner"
        >
          <FiAlertTriangle className="text-5xl text-error drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Oops! Something went wrong.
          </h1>
          <p className="text-neutral-400 mb-8 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            We're experiencing some technical difficulties on our end. Please try refreshing the page or come back later.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-neutral-900 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <FiRefreshCw className="text-lg" />
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-700/40 text-white rounded-xl font-semibold hover:bg-neutral-600/50 transition-all duration-300 border border-neutral-600 hover:border-neutral-500"
          >
            <FiArrowLeft className="text-lg" />
            Go Back
          </button>
        </motion.div>

        {/* Decorative error code subtle text */}
        <div className="absolute bottom-4 right-6 opacity-10 font-mono text-6xl font-black pointer-events-none select-none">
          500
        </div>
      </motion.div>
    </div>
  );
};

export default Error;
