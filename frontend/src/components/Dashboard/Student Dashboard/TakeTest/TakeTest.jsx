import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { 
    PiBookOpenFill, 
    PiEarFill, 
    PiPencilLineFill, 
    PiMicrophoneStageFill,
    PiClockFill,
    PiQuestionFill,
    PiChartLineUpFill,
    PiArrowRightBold,
    PiSparkleFill
} from "react-icons/pi";

const sectionTests = [
  {
    title: 'Listening Lab',
    description: 'Academic lectures and everyday conversations with time-based immersive audio.',
    icon: <PiEarFill />,
    color: 'from-emerald-500 to-teal-600',
    lightColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    duration: '30 min',
    questions: '40 Qs',
    band: '6.5-7.0',
    to: '/dashboard/listening',
  },
  {
    title: 'Reading Lab',
    description: 'Complex passages covering science and technology with deep comprehension checks.',
    icon: <PiBookOpenFill />,
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    duration: '60 min',
    questions: '40 Qs',
    band: '7.0-8.0',
    to: '/dashboard/reading',
  },
  {
    title: 'Writing Lab',
    description: 'Guided Task 1 & 2 prompts to master essay structure, coherence, and lexical range.',
    icon: <PiPencilLineFill />,
    color: 'from-purple-500 to-pink-600',
    lightColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    duration: '60 min',
    questions: '2 Tasks',
    band: '6.0-7.5',
    to: '/dashboard/writing',
  },
  {
    title: 'Speaking Lab',
    description: 'Real-time cue cards and follow-up prompts to build professional fluency and confidence.',
    icon: <PiMicrophoneStageFill />,
    color: 'from-orange-500 to-red-600',
    lightColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    duration: '15 min',
    questions: '3 Parts',
    band: '6.5-7.5',
    to: '/dashboard/speaking',
  },
];

const TakeTest = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12 pb-24"
        >
            {/* --- IMMERSIVE HEADER --- */}
            <motion.section 
                variants={item}
                className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-indigo-900 via-slate-900 to-black p-12 lg:p-20 text-white shadow-2xl"
            >
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary border border-primary/20 backdrop-blur-md">
                        <PiSparkleFill className="text-yellow-400" /> Mastery Pathways
                    </div>
                    <div className="max-w-3xl">
                        <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
                            Select Your <br />
                            <span className="text-primary italic">Practice Lab</span>
                        </h1>
                        <p className="mt-8 text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            Target specific IELTS skills with our optimized training modules. 
                            Each lab is designed to simulate actual exam pressure while providing a focused learning environment.
                        </p>
                    </div>
                </div>

                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
            </motion.section>

            {/* --- SECTION GRID --- */}
            <motion.section variants={item} className="grid gap-10 xl:grid-cols-2">
                {sectionTests.map((test) => (
                    <motion.div 
                        key={test.title}
                        whileHover={{ y: -8 }}
                        className="group relative flex flex-col rounded-[3.5rem] bg-white border border-base-300 p-10 lg:p-12 shadow-sm transition-all hover:shadow-2xl hover:border-primary/30"
                    >
                        <div className="flex flex-col h-full space-y-10">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className={`flex h-20 w-20 items-center justify-center rounded-[2rem] text-4xl text-white shadow-xl bg-linear-to-br ${test.color}`}>
                                    {test.icon}
                                </div>
                                <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${test.lightColor}`}>
                                    Official Format
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">{test.title}</h2>
                                <p className="text-base-content/60 font-medium leading-relaxed">
                                    {test.description}
                                </p>
                            </div>

                            {/* Stats Units */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-5 rounded-[1.8rem] bg-base-100 border border-base-200 flex flex-col items-center text-center group-hover:bg-primary/5 group-hover:border-primary/10 transition-all">
                                    <PiClockFill className="text-xl text-base-content/20 mb-2 group-hover:text-primary/40" />
                                    <div className="text-xs font-black tracking-tighter">{test.duration}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-base-content/30 mt-1">Duration</div>
                                </div>
                                <div className="p-5 rounded-[1.8rem] bg-base-100 border border-base-200 flex flex-col items-center text-center group-hover:bg-primary/5 group-hover:border-primary/10 transition-all">
                                    <PiQuestionFill className="text-xl text-base-content/20 mb-2 group-hover:text-primary/40" />
                                    <div className="text-xs font-black tracking-tighter">{test.questions}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-base-content/30 mt-1">Questions</div>
                                </div>
                                <div className="p-5 rounded-[1.8rem] bg-base-100 border border-base-200 flex flex-col items-center text-center group-hover:bg-primary/5 group-hover:border-primary/10 transition-all">
                                    <PiChartLineUpFill className="text-xl text-base-content/20 mb-2 group-hover:text-primary/40" />
                                    <div className="text-xs font-black tracking-tighter">{test.band}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-base-content/30 mt-1">Band Est.</div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <Link 
                                to={test.to} 
                                className="btn btn-block rounded-[1.8rem] h-16 bg-slate-900 text-white border-none text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-primary/30 group/btn transition-all"
                            >
                                Enter Practice Lab
                                <PiArrowRightBold className="ml-2 transition-transform group-hover/btn:translate-x-2" />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </motion.section>
        </motion.div>
    );
};

export default TakeTest;
