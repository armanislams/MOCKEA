import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { FiLock, FiHome, FiLogIn } from 'react-icons/fi';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-warning/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-120 h-120 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50 rounded-3xl p-8 shadow-2xl relative z-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-warning/30"
        >
          <FiLock className="text-4xl text-warning" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-2"
        >
          401
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-semibold text-neutral-200 mb-4"
        >
          Unauthorized Access
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-neutral-400 mb-8"
        >
          Oops! It looks like you're not logged in or your session has expired. Please log in to continue accessing this page.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-warning text-warning-content rounded-xl font-medium hover:bg-warning/90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-warning/20"
          >
            <FiLogIn />
            Log In Now
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-700/50 text-white rounded-xl font-medium hover:bg-neutral-600/50 transition-all duration-300 border border-neutral-600 hover:border-neutral-500"
          >
            <FiHome />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
