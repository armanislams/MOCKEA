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
import useUserProfile from "../../../../hooks/useUserProfile";

// --- Section config — two variants: IELTS and PTE ---
const SECTIONS_IELTS = [
    {
        title: 'Listening Test',
        description: 'Academic lectures and everyday conversations with time-based immersive audio.',
        icon: <PiEarFill />,
        color: 'from-emerald-500 to-teal-600',
        lightColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        duration: '30 min',
        questions: '40 Qs',
        scoreLabel: 'Band Est.',
        score: '6.5–7.0',
        to: '/dashboard/listening',
    },
    {
        title: 'Reading Test',
        description: 'Complex passages covering science and technology with deep comprehension checks.',
        icon: <PiBookOpenFill />,
        color: 'from-blue-500 to-indigo-600',
        lightColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        duration: '60 min',
        questions: '40 Qs',
        scoreLabel: 'Band Est.',
        score: '7.0–8.0',
        to: '/dashboard/reading',
    },
    {
        title: 'Writing Test',
        description: 'Guided Task 1 & 2 prompts to master essay structure, coherence, and lexical range.',
        icon: <PiPencilLineFill />,
        color: 'from-purple-500 to-pink-600',
        lightColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        duration: '60 min',
        questions: '2 Tasks',
        scoreLabel: 'Band Est.',
        score: '6.0–7.5',
        to: '/dashboard/writing',
    },
    {
        title: 'Speaking Test',
        description: 'Real-time cue cards and follow-up prompts to build professional fluency and confidence.',
        icon: <PiMicrophoneStageFill />,
        color: 'from-orange-500 to-red-600',
        lightColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        duration: '15 min',
        questions: '3 Parts',
        scoreLabel: 'Band Est.',
        score: '6.5–7.5',
        to: '/dashboard/speaking',
    },
];

const SECTIONS_PTE = [
    {
        title: 'Listening Test',
        description: 'Summarise spoken text, fill-in-the-blanks, and highlight correct summary tasks.',
        icon: <PiEarFill />,
        color: 'from-emerald-500 to-teal-600',
        lightColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        duration: '45 min',
        questions: '20–30 Qs',
        scoreLabel: 'Score Est.',
        score: '50–70',
        to: '/dashboard/listening',
    },
    {
        title: 'Reading Test',
        description: 'Multiple choice, reorder paragraphs, and fill-in-the-blanks across academic texts.',
        icon: <PiBookOpenFill />,
        color: 'from-blue-500 to-indigo-600',
        lightColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        duration: '29 min',
        questions: '15–20 Qs',
        scoreLabel: 'Score Est.',
        score: '55–75',
        to: '/dashboard/reading',
    },
    {
        title: 'Writing Test',
        description: 'Summarise written text and compose argumentative essays under strict time limits.',
        icon: <PiPencilLineFill />,
        color: 'from-purple-500 to-pink-600',
        lightColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        duration: '50 min',
        questions: '2 Tasks',
        scoreLabel: 'Score Est.',
        score: '50–65',
        to: '/dashboard/writing',
    },
    {
        title: 'Speaking Test',
        description: 'Read aloud, repeat sentence, describe image, and retell lecture with AI scoring.',
        icon: <PiMicrophoneStageFill />,
        color: 'from-orange-500 to-red-600',
        lightColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        duration: '30 min',
        questions: '5 Types',
        scoreLabel: 'Score Est.',
        score: '45–65',
        to: '/dashboard/speaking',
    },
];

const TakeTest = () => {
    const { userData } = useUserProfile();
    const targetExam = userData?.targetExam || "IELTS";

    const userPlan = userData?.plan || "free";
    const userRole = userData?.role || "student";

    // Select content based on user preference — BOTH shows IELTS sections as primary
    let sectionTests = targetExam === "PTE" ? SECTIONS_PTE : SECTIONS_IELTS;

    // Free tier users can only access Listening and Reading sections
    if (userRole !== "admin" && userRole !== "instructor" && userPlan === "free") {
        sectionTests = sectionTests.filter(sec => 
            sec.title.toLowerCase().includes("listening") || 
            sec.title.toLowerCase().includes("reading")
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const examBadgeStyle = {
        IELTS: "bg-white/20 text-white border-white/30",
        PTE: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
        BOTH: "bg-amber-500/20 text-amber-400 border-amber-400/30",
    };

    const examLabel = {
        IELTS: "🎓 IELTS Program",
        PTE: "📘 PTE Academic Program",
        BOTH: "🌐 IELTS + PTE Program",
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
                className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-primary to-indigo-700 p-12 lg:p-20 text-white shadow-2xl shadow-primary/30"
            >
                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 backdrop-blur-md">
                            <PiSparkleFill className="text-yellow-400" /> Mastery Pathways
                        </div>
                        {/* Exam track badge */}
                        <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] border backdrop-blur-md ${examBadgeStyle[targetExam] || examBadgeStyle.IELTS}`}>
                            {examLabel[targetExam] || examLabel.IELTS}
                        </div>
                    </div>
                    <div className="max-w-3xl">
                        <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
                            Select Your <br />
                            <span className="text-yellow-300 italic">Practice Test</span>
                        </h1>
                        <p className="mt-8 text-lg lg:text-xl text-white/80 font-medium leading-relaxed max-w-2xl">
                            {targetExam === "PTE"
                                ? "Target specific PTE Academic skills with our optimized training modules. Each test simulates actual PTE exam tasks for maximum score improvement."
                                : "Target specific IELTS skills with our optimized training modules. Each test is designed to simulate actual exam pressure while providing a focused learning environment."
                            }
                        </p>
                    </div>
                </div>

                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-primary-focus/20 blur-3xl" />
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
                                    <div className="text-xs font-black tracking-tighter">{test.score}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-base-content/30 mt-1">{test.scoreLabel}</div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <Link 
                                to={test.to} 
                                className="btn btn-block rounded-[1.8rem] h-16 bg-slate-900 text-white border-none text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-primary/30 group/btn transition-all"
                            >
                                Enter Practice Test
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
