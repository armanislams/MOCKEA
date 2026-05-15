import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { FiShieldOff, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[160px] h-[160px] bg-error/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full bg-neutral-800/60 backdrop-blur-2xl border border-error/20 rounded-[2.5rem] p-10 shadow-2xl relative z-10 text-center overflow-hidden"
      >
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-error to-transparent opacity-50"></div>

        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="w-28 h-28 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-error/20 shadow-[0_0_30px_rgba(248,113,113,0.2)]"
        >
          <FiShieldOff className="text-5xl text-error" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-br from-error to-red-400 mb-2"
        >
          403
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-white mb-4"
        >
          Access Denied
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-neutral-400 mb-8 leading-relaxed text-sm md:text-base"
        >
          You don't have permission to access this directory or page using the credentials that you supplied. If you believe this is an error, please contact your administrator.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 bg-error text-error-content rounded-xl font-medium hover:bg-error/90 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-error/20"
          >
            <FiArrowLeft />
            Go Back
          </button>
          <Link
            to="/support"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-700/50 text-white rounded-xl font-medium hover:bg-neutral-600/50 transition-all duration-300 border border-neutral-600 hover:border-neutral-500 backdrop-blur-md"
          >
            <FiMessageSquare />
            Contact Support
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Forbidden;
