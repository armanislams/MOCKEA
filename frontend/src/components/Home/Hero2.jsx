import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiPlay } from 'react-icons/fi';
import heroStudent from '../../assets/hero-student.png';
import heroAbstract from '../../assets/hero-abstract.png';
import heroGroup from '../../assets/hero-group.png';
import { Link } from 'react-router';

const Hero2 = () => {
  return (
    <div className="relative min-h-[60vh] lg:h-[80vh] flex items-center bg-[#09090b] overflow-hidden font-sans text-white py-20 lg:py-0">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Column: Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
            <span className="text-sm font-medium text-cyan-200 tracking-wide">The Future of Testing is Here</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight"
          >
            YOUR REAL IELTS EXPERIENCE <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-cyan-400 to-blue-500">STARTS HERE .</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl text-gray-400 max-w-lg leading-relaxed"
          >
            Welcome to <span className="text-white font-semibold">MOCKEA</span>. Experience interactive online exams that don't put you to sleep. Track your stats, compete with friends, and dominate your next test.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link to={'/dashboard'} className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <span className="relative z-10">Start Mock Exam</span>
              <FiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-linear-to-r from-cyan-300 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2">
              <FiPlay /> Watch Demo
            </button>
          </motion.div>

          {/* User Avatars / Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-4">
              <img className="w-10 h-10 rounded-full border-2 border-[#09090b] object-cover" src="https://i.pravatar.cc/100?img=1" alt="Student" />
              <img className="w-10 h-10 rounded-full border-2 border-[#09090b] object-cover" src="https://i.pravatar.cc/100?img=2" alt="Student" />
              <img className="w-10 h-10 rounded-full border-2 border-[#09090b] object-cover" src="https://i.pravatar.cc/100?img=3" alt="Student" />
              <img className="w-10 h-10 rounded-full border-2 border-[#09090b] object-cover" src="https://i.pravatar.cc/100?img=4" alt="Student" />
            </div>
            <div className="text-sm">
              <p className="text-white font-bold">10k+ Students</p>
              <p className="text-gray-500">Already leveling up</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Dynamic Images */}
        <div className="w-full lg:w-1/2 relative h-[350px] lg:h-[450px] flex items-center justify-center mt-10 lg:mt-0">
          
          {/* Main central image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="absolute z-20 w-[65%] h-[75%] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
          >
            <img src={heroStudent} alt="Student taking exam" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-green-400">Live Exam</span>
              </div>
              <p className="font-semibold">Advanced Mathematics</p>
            </div>
          </motion.div>

          {/* Top right floating image */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: -50 }}
            animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
            transition={{ 
              opacity: { duration: 0.6, delay: 0.4 },
              x: { duration: 0.6, delay: 0.4 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute z-30 top-[2%] right-[0%] w-[45%] h-[40%] rounded-2xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-md"
          >
            <img src={heroAbstract} alt="Abstract exam elements" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-4">
              <div className="flex items-center gap-2">
                <div className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-full backdrop-blur-md">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Global Rank</p>
                  <p className="text-sm font-bold text-white">Top 1%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom left floating image */}
          <motion.div
            initial={{ opacity: 0, x: -50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: [0, 15, 0] }}
            transition={{ 
              opacity: { duration: 0.6, delay: 0.6 },
              x: { duration: 0.6, delay: 0.6 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
            className="absolute z-10 bottom-[5%] left-[0%] w-[50%] h-[45%] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img src={heroGroup} alt="Group study" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
               <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Study Groups</p>
                  <p className="text-sm font-bold text-white">Collaborate & Win</p>
                </div>
            </div>
          </motion.div>

          {/* Floating decorative elements */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] left-[10%] w-16 h-16 border border-dashed border-cyan-500/30 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] right-[10%] w-24 h-24 border border-purple-500/20 rounded-xl"
          />
          
        </div>
      </div>
    </div>
  );
};

export default Hero2;
