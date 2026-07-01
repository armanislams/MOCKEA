import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiPlay } from 'react-icons/fi';
import heroStudent from '../assets/hero-student.png';
import heroAbstract from '../assets/hero-abstract.png';
import heroGroup from '../assets/hero-group.png';
import { Link } from 'react-router';

const PteHero = () => {
  return (
    <div className="relative min-h-[60vh] lg:h-screen flex items-center bg-white font-sans text-gray-900 py-5 md:py-10 lg:py-0">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Column: Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 md:px-4 md:py-2 px-2 py-1 rounded-full bg-blue-50 border border-blue-100"
          >
            <span className="flex w-2 h-2 rounded-full animate-bounce bg-blue-500 shrink-0"></span>
            <span className="text-sm font-medium text-blue-600 tracking-wide">PTE Academic Preparation Portal</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[100%] tracking-normal text-gray-900"
          >
            YOUR REAL PTE EXPERIENCE <br className="hidden lg:block"/>
            <span className="text-blue-600">STARTS HERE .</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg leading-relaxed"
          >
            Welcome to <span className="text-blue-600 font-bold text-3xl">MOCKEA</span>. Experience interactive online PTE Academic practice tests. Master Describe Image, Write Essay, and Retell Lecture with instant AI feedback.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none sm:w-auto"
          >
            <Link to={'/dashboard'} className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              <span className="relative z-10">Start PTE Practice</span>
              <FiArrowRight className="relative animate-ping z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-gray-100 border border-gray-200 text-gray-800 font-bold rounded-xl transition-all hover:bg-gray-200 flex items-center justify-center gap-2">
              <FiPlay /> Watch Demo
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-4">
              <img className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover" src="https://i.pravatar.cc/100?img=11" alt="Student" />
              <img className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover" src="https://i.pravatar.cc/100?img=12" alt="Student" />
              <img className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover" src="https://i.pravatar.cc/100?img=13" alt="Student" />
              <img className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover" src="https://i.pravatar.cc/100?img=14" alt="Student" />
            </div>
            <div className="text-sm text-left">
              <p className="text-gray-900 font-bold">5k+ PTE Students</p>
              <p className="text-gray-500">Already practice-ready</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Dynamic Images */}
        <div className="w-full lg:w-1/2 relative h-[300px] sm:h-[400px] lg:h-[450px] flex items-center justify-center mt-6 sm:mt-10 lg:mt-0 max-w-[280px] min-[360px]:max-w-[320px] min-[400px]:max-w-[360px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-none mx-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="absolute z-20 w-[65%] h-[75%] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-md"
          >
            <img src={heroStudent} alt="Student taking PTE exam" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-400">Live PTE Session</span>
              </div>
              <p className="font-semibold text-xs sm:text-sm md:text-base">PTE Academic Test Prep</p>
            </div>
          </motion.div>

          {/* Abstract details */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: 30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.4 }}
            className="absolute left-[-2%] bottom-[2%] w-[45%] h-[40%] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-md z-30 bg-white p-3 sm:p-4 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-blue-500 text-base sm:text-xl shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-gray-800">Mock Complete</span>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">Overall Score</p>
              <p className="text-xl sm:text-2xl font-black text-blue-600">79 / 90</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, y: -30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
            className="absolute right-[-2%] top-[2%] w-[45%] h-[40%] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-md z-10"
          >
            <img src={heroAbstract} alt="Abstract stats design" className="w-full h-full object-cover" />
          </motion.div>

          {/* User badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute top-1/2 left-[-15%] sm:left-[-12%] z-30 bg-white/95 backdrop-blur-md border border-gray-200/50 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-2.5 max-w-[130px] sm:max-w-[160px] hidden min-[360px]:flex"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <img src={heroGroup} alt="Profile badge" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-800 leading-none mb-0.5">Score Analysis</p>
              <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium">99th percentile</span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default PteHero;
