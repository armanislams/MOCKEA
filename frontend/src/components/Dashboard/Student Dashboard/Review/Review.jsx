import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useState } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { 
    PiClipboardText, 
    PiCheckCircleFill, 
    PiHourglassFill, 
    PiWarningCircleFill,
    PiCaretRightBold,
    PiBookOpen,
    PiEar,
    PiPencilLine,
    PiMicrophoneStage,
    PiFilesFill,
    PiSelectionAllFill,
    PiNotebookFill,
    PiMicrophoneFill,
    PiCheckCircleBold,
    PiMagnifyingGlassFill
} from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";

const Review = () => {
    const axiosSecure = useAxiosSecure();
    const [activeTab, setActiveTab] = useState("mock-tests");

    // Full Mock Tests Query
    const { data: mockResults = [], isLoading: loadingMock } = useQuery({
        queryKey: ["user-mock-results"],
        queryFn: async () => {
            const res = await axiosSecure.get("/mock-tests/results/user");
            return res.data.results ?? [];
        }
    });

    // Individual Lab Submissions Query
    const { data: labResults = [], isLoading: loadingLabs } = useQuery({
        queryKey: ["user-lab-results"],
        queryFn: async () => {
            const res = await axiosSecure.get("/submissions/my-submissions");
            return res.data.submissions ?? [];
        }
    });

    const getStatusIcon = (isGraded) => {
        return isGraded 
            ? <PiCheckCircleFill className="text-success w-5 h-5" /> 
            : <PiHourglassFill className="text-warning w-5 h-5 animate-pulse" />;
    };

    const getModuleIcon = (type) => {
        switch(type) {
            case 'reading': return <PiBookOpen className="text-blue-500" />;
            case 'listening': return <PiEar className="text-purple-500" />;
            case 'writing': return <PiPencilLine className="text-orange-500" />;
            case 'speaking': return <PiMicrophoneStage className="text-green-500" />;
            default: return <PiClipboardText />;
        }
    };

    return (
        <div className="space-y-10 p-2">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3">Performance Hub</p>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                        Results & <span className="text-primary italic">Analytics</span>
                    </h1>
                </div>

                {/* Tab Switcher */}
                <div className="bg-white p-2 rounded-[2rem] border border-base-300 shadow-sm flex items-center gap-1">
                    <button 
                        onClick={() => setActiveTab("mock-tests")}
                        className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'mock-tests' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-base-100'}`}
                    >
                        <PiFilesFill className="text-lg" /> Mock Tests
                    </button>
                    <button 
                        onClick={() => setActiveTab("skill-labs")}
                        className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'skill-labs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-base-100'}`}
                    >
                        <PiSelectionAllFill className="text-lg" /> Skill Labs
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "mock-tests" ? (
                    <motion.div 
                        key="mock"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 gap-8"
                    >
                        {loadingMock ? (
                            [1, 2].map(i => <div key={i} className="h-48 bg-base-300 animate-pulse rounded-[2.5rem]" />)
                        ) : mockResults.length > 0 ? (
                            mockResults.map((result) => (
                                <div key={result._id} className="group card bg-white border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden">
                                    <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="badge badge-primary badge-sm font-black uppercase tracking-widest px-3 py-3 rounded-lg">Full Mock</span>
                                                <span className="text-xs font-bold text-base-content/30 uppercase tracking-widest">
                                                    {new Date(result.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                                                {result.testId?.title}
                                            </h2>
                                            <div className="flex items-center gap-6 pt-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 uppercase tracking-widest">
                                                    <PiWarningCircleFill className="text-error" /> {result.tabSwitchCount} Violations
                                                </div>
                                                <div className="badge badge-ghost font-bold uppercase text-[10px] tracking-widest px-4 py-3">
                                                    Status: {result.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            {['reading', 'listening', 'writing', 'speaking'].map((type) => {
                                                const section = result.sectionResults.find(s => s.sectionType === type);
                                                return (
                                                    <div key={type} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-base-100 border border-base-200 min-w-[100px] group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                                        <div className="text-2xl">{getModuleIcon(type)}</div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{type[0]}</span>
                                                            {getStatusIcon(section?.isGraded)}
                                                        </div>
                                                        <div className="text-lg font-black text-primary">
                                                            {section?.isGraded ? section.score : "--"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <Link 
                                            to={`/dashboard/review/${result._id}`}
                                            className="btn btn-ghost btn-circle self-center hidden lg:flex group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-base-200"
                                        >
                                            <PiCaretRightBold />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-base-300 rounded-[3rem] text-center space-y-6">
                                <PiMagnifyingGlassFill className="text-6xl text-base-content/10" />
                                <h2 className="text-2xl font-black tracking-tight opacity-40">No Mock Tests Found</h2>
                                <Link to="/dashboard/full-mock-test" className="btn btn-primary rounded-2xl px-10 h-14 font-black shadow-xl">
                                    Start Mock Test
                                </Link>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="labs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {loadingLabs ? (
                            [1, 2, 3].map(i => <div key={i} className="h-48 bg-base-300 animate-pulse rounded-[2.5rem]" />)
                        ) : labResults.length > 0 ? (
                            labResults.map((lab) => (
                                <div key={lab._id} className="card bg-white border border-base-300 shadow-sm rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all group">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${lab.status === 'reviewed' ? 'bg-emerald-500 text-white' : 'bg-warning/10 text-warning'}`}>
                                                    {lab.testType === 'writing' ? <PiNotebookFill /> : <PiMicrophoneFill />}
                                                </div>
                                                <div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${lab.status === 'reviewed' ? 'text-emerald-600' : 'text-warning'}`}>
                                                        {lab.status === 'reviewed' ? 'Evaluation Ready' : 'Pending Review'}
                                                    </span>
                                                    <h3 className="text-xl font-black text-slate-800 line-clamp-1">{lab.title}</h3>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(lab.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {lab.status === 'reviewed' ? (
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 min-w-[80px]">
                                                    <span className="text-2xl font-black text-emerald-600">{lab.score}%</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60">Score</span>
                                                </div>
                                                <div className="flex flex-col items-center p-4 bg-primary/5 rounded-2xl border border-primary/10 min-w-[80px]">
                                                    <span className="text-2xl font-black text-primary">{lab.bandScore}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Band</span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-xs font-medium text-slate-500 italic line-clamp-2">
                                                        "{lab.feedback}"
                                                    </p>
                                                    {lab.reviewedByName && (
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/40">
                                                            Evaluated by {lab.reviewedByName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                                <PiHourglassFill className="text-warning text-xl animate-spin-slow" />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting instructor evaluation...</p>
                                            </div>
                                        )}

                                        {lab.testType === 'speaking' && (
                                            <div className="px-2">
                                                <audio controls src={lab.content} className="w-full h-10" />
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-base-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-base-content/20 uppercase tracking-[0.2em]">{lab.testType} Practice Lab</span>
                                            {lab.status === 'reviewed' && (
                                                <div className="flex items-center gap-2 text-emerald-600">
                                                    <PiCheckCircleBold />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Performance</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-base-300 rounded-[3rem] text-center space-y-6">
                                <PiMagnifyingGlassFill className="text-6xl text-base-content/10" />
                                <h2 className="text-2xl font-black tracking-tight opacity-40">No Lab Practice Found</h2>
                                <Link to="/dashboard/practice" className="btn btn-primary rounded-2xl px-10 h-14 font-black shadow-xl">
                                    Browse Skill Labs
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Review;
