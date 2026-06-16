import { motion } from "framer-motion";
import { 
  FiTarget, 
  FiAward, 
  FiCpu, 
  FiShield, 
  FiTrendingUp, 
  FiUsers, 
  FiBookOpen, 
  FiClock 
} from "react-icons/fi";
import { Link } from "react-router";

export default function AboutPage() {
  // Animation presets
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const stats = [
    { number: "10K+", label: "Active Aspirants", icon: FiUsers, color: "text-blue-600 bg-blue-50" },
    { number: "98.7%", label: "Satisfaction Rate", icon: FiAward, color: "text-red-500 bg-red-50" },
    { number: "150K+", label: "Simulated Tests", icon: FiBookOpen, color: "text-emerald-500 bg-emerald-50" },
    { number: "24/7", label: "AI Feedback Loops", icon: FiCpu, color: "text-purple-500 bg-purple-50" }
  ];

  const pillars = [
    {
      title: "Real Exam Simulation",
      description: "Replicates the official IELTS testing interface down to the minute. Complete Reading, Listening, Writing, and Speaking tasks with standard countdown timers and live response validation.",
      icon: FiClock,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Gemini-Powered IELTS Tutor",
      description: "Get instant guidance from our intelligent AI Study Buddy. Toggle between a friendly tutor offering detailed tips, a strict examiner scoring your tasks, or a general system navigator.",
      icon: FiCpu,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Expert Instructor Evaluations",
      description: "Submit complex writing and speaking responses for peer and expert instructor review. Get official IELTS band scores (0-9) accompanied by qualitative, structured grading feedback.",
      icon: FiAward,
      gradient: "from-red-500 to-orange-500"
    },
    {
      title: "Exam Integrity Shields",
      description: "Custom integrity mechanisms lock the simulator in full-screen mode, detecting page exits or tab switching. This builds real exam focus and ensures valid mock results.",
      icon: FiShield,
      gradient: "from-emerald-500 to-teal-600"
    }
  ];

  const team = [
    {
      name: "Dr. Evelyn Cartwright",
      role: "Chief Academic Officer",
      bio: "Former British Council Head Examiner with over 18 years of experience crafting academic assessment standards.",
      initials: "EC",
      color: "bg-blue-600"
    },
    {
      name: "Marcus Vance",
      role: "Lead AI & Technology Architect",
      bio: "Machine learning research fellow specializes in fine-tuning natural language processing systems for language proficiency metrics.",
      initials: "MV",
      color: "bg-purple-600"
    },
    {
      name: "Sonia Al-Mansoor",
      role: "Head of Product Design",
      bio: "Advocate for accessibility-first UX, focusing on reducing exam-day anxiety through clean, supportive digital workflows.",
      initials: "SA",
      color: "bg-rose-500"
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full filter blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-100/20 rounded-full filter blur-3xl -z-10" />

        {/* 1. Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E30613] bg-red-50 border border-red-100 rounded-full mb-6"
          >
            <FiTarget className="w-4 h-4 text-[#E30613] animate-spin-slow" />
            Our Mission & Story
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#000f38] tracking-tight mb-6 leading-none"
          >
            Bridge the Gap Between <br />
            <span className="bg-gradient-to-r from-blue-600 via-[#0028a2] to-red-500 bg-clip-text text-transparent">
              Preparation and Performance
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            MOCKEA is a comprehensive, full-stack monorepo web platform engineered to recreate genuine IELTS testing conditions. We integrate next-gen LLM tutoring, browser-safe simulators, and structured human grading to help you hit your target band score.
          </motion.p>
        </div>

        {/* 2. Platform Stats */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24 max-w-6xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
            >
              <div className={`p-3.5 rounded-xl ${stat.color} shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{stat.number}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. Core Pillars */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-[#000f38] mb-4">The Pillars of MOCKEA</h2>
            <p className="text-slate-600">
              Traditional mock tests lack constructive feedback, while classroom courses can be slow and rigid. MOCKEA brings the best of both worlds.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs relative overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-white mb-6 shadow-md`}>
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{pillar.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 4. Detailed Philosophy & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 max-w-6xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#0028a2] to-red-500" />
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black uppercase text-blue-600 tracking-wider">How we started</span>
            <h2 className="text-3xl font-black text-[#000f38] leading-tight">
              Designed to solve the hardest part of self-study: realistic feedback.
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Preparing for standard language testing is notoriously difficult to self-grade. While multiple-choice reading and listening sections are straightforward, the IELTS Writing and Speaking assessments require deep human analysis. Students often spend thousands on private coaches just to get their practice essays checked.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              MOCKEA was created in 2025 to democratize premium language evaluation. By building highly-optimized AI grading systems using Gemini 2.5 Flash, paired with a workflow that allows native instructors to review and double-check scores, we give you accurate, fast evaluations at a fraction of the cost.
            </p>
          </div>
          <div className="lg:col-span-5 bg-[#FAF9F6] p-8 rounded-2xl border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800">Our Core Principles</h3>
            <ul className="space-y-3">
              {[
                { title: "Student Empowerment", desc: "Access premium diagnostic support without high cost barriers." },
                { title: "Absolute Authenticity", desc: "Replicate visual stress, countdowns, and timers of real tests." },
                { title: "Continuous Iteration", desc: "Learn from every error through detailed rubrics and AI dialogue." }
              ].map((principle, idx) => (
                <li key={idx} className="flex gap-3 items-start text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{principle.title}</h4>
                    <p className="text-slate-500 mt-0.5 text-xs">{principle.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Team & Experts */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-[#000f38] mb-4">Meet Our Educational Leadership</h2>
            <p className="text-slate-600">
              Our multidisciplinary team combines advanced machine learning research with decades of combined language instruction.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col items-center hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl ${member.color} flex items-center justify-center text-white text-xl font-bold mb-5 shadow-inner`}>
                  {member.initials}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{member.name}</h3>
                <span className="text-xs font-black uppercase text-blue-600 tracking-wider mb-4 block">{member.role}</span>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 6. CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#000f38] text-white p-8 sm:p-12 text-center shadow-lg"
        >
          {/* Accent decoration overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-2xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-red-500/10 rounded-full filter blur-2xl -z-10" />
          
          <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight leading-tight">
            Ready to Dominate Your Next IELTS Test?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Create a free account, complete modular practice sessions, and see how MOCKEA's real simulator boosts your performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/auth/register" 
              className="px-8 py-3.5 bg-[#E30613] hover:bg-[#c20510] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg w-full sm:w-auto"
            >
              Sign Up For Free
            </Link>
            <Link 
              to="/pricing" 
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all duration-300 w-full sm:w-auto"
            >
              View Membership Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
