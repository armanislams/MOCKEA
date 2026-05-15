import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Loader from "../../Loader/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { 
    PiGraduationCap, 
    PiUser, 
    PiCalendar, 
    PiWarning,
    PiCheckCircle,
    PiPencilLine,
    PiMicrophoneStage,
    PiCaretRightBold,
    PiCheckBold,
    PiFilesFill,
    PiSelectionAllFill,
    PiNotePencilFill,
    PiMicrophoneStageFill,
    PiUserCircleFill,
    PiXCircleFill,
    PiArrowRightBold,
    PiCheckCircleFill,
    PiMagnifyingGlassFill
} from "react-icons/pi";

const GradeSubmissions = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("mock-tests"); // 'mock-tests' or 'skill-labs'
    
    /* --- Full Mock Test State --- */
    const [scores, setScores] = useState({});
    const { data: results = [], isLoading: loadingMock } = useQuery({
        queryKey: ["all-mock-results"],
        queryFn: async () => {
            const res = await axiosSecure.get("/mock-tests/results/all");
            return res.data.results ?? [];
        }
    });

    const gradeMutation = useMutation({
        mutationFn: (data) => axiosSecure.patch("/mock-tests/grade-section", data),
        onSuccess: () => {
            toast.success("Section graded successfully");
            queryClient.invalidateQueries(["all-mock-results"]);
        }
    });

    const handleGradeSubmit = (resultId, sectionType) => {
        const score = scores[`${resultId}-${sectionType}`];
        if (!score) return toast.error("Please enter a score");
        gradeMutation.mutate({ resultId, sectionType, score: parseFloat(score) });
    };

    /* --- Skill Labs State --- */
    const [submissions, setSubmissions] = useState([]);
    const [loadingLabs, setLoadingLabs] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [reviewData, setReviewData] = useState({ score: "", bandScore: "", feedback: "" });
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState({ status: "pending", testType: "" });

    const fetchSubmissions = async () => {
        try {
            setLoadingLabs(true);
            const { data } = await axiosSecure.get(`/submissions?status=${filter.status}&testType=${filter.testType}`);
            setSubmissions(data.submissions);
            setLoadingLabs(false);
        } catch (error) {
            toast.error("Failed to load practice submissions");
            setLoadingLabs(false);
        }
    };

    useEffect(() => {
        if (activeTab === "skill-labs") fetchSubmissions();
    }, [activeTab, filter]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const { data } = await axiosSecure.patch(`/submissions/review/${selectedSubmission._id}`, reviewData);
            if (data.success) {
                toast.success("Review submitted successfully!");
                setSelectedSubmission(null);
                setReviewData({ score: "", bandScore: "", feedback: "" });
                fetchSubmissions();
            }
        } catch (error) {
            toast.error("Evaluation failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-10 p-2">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3">Academic Evaluation Hub</p>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                        Review <span className="text-primary italic">Center</span>
                    </h1>
                </div>

                {/* Tab Switcher */}
                <div className="bg-white p-2 rounded-[2rem] border border-base-300 shadow-sm flex items-center gap-1">
                    <button 
                        onClick={() => setActiveTab("mock-tests")}
                        className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'mock-tests' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-base-100'}`}
                    >
                        <PiFilesFill className="text-lg" /> Full Mock Tests
                    </button>
                    <button 
                        onClick={() => setActiveTab("skill-labs")}
                        className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'skill-labs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-base-100'}`}
                    >
                        <PiSelectionAllFill className="text-lg" /> Individual Labs
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
                        className="space-y-6"
                    >
                        {loadingMock ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-base-300 animate-pulse rounded-3xl" />)
                        ) : results.length === 0 ? (
                            <div className="card bg-white border border-base-300 p-20 flex flex-col items-center justify-center text-center space-y-4 rounded-[3rem]">
                                <PiMagnifyingGlassFill className="text-6xl text-base-content/10" />
                                <h3 className="text-xl font-black opacity-30 uppercase tracking-tighter">No Mock Tests to Grade</h3>
                            </div>
                        ) : (
                            results.map((result) => (
                                <div key={result._id} className="card bg-white border border-base-300 shadow-sm overflow-hidden hover:shadow-xl transition-all rounded-[2.5rem] group">
                                    <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="avatar placeholder">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                                    {result.userId?.name?.[0]}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-slate-800">{result.userId?.name}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{result.testId?.title}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-base-content/20 flex items-center gap-1">
                                                        <PiCalendar /> {new Date(result.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            {['writing', 'speaking'].map(type => {
                                                const section = result.sectionResults.find(s => s.sectionType === type);
                                                if (!section) return null;

                                                return (
                                                    <div key={type} className={`flex items-center gap-5 p-5 rounded-[2rem] border transition-all ${
                                                        section.isGraded ? "bg-emerald-50/50 border-emerald-500/20" : "bg-warning/5 border-warning/20 border-dashed"
                                                    }`}>
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${section.isGraded ? 'bg-emerald-500 text-white' : 'bg-warning/10 text-warning'}`}>
                                                            {type === 'writing' ? <PiPencilLine /> : <PiMicrophoneStage />}
                                                        </div>
                                                        <div className="flex flex-col min-w-[120px]">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{type}</span>
                                                            {section.isGraded ? (
                                                                <span className="text-lg font-black text-emerald-600">{section.score}</span>
                                                            ) : (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder="Band"
                                                                        step="0.5"
                                                                        className="input input-sm w-20 rounded-lg font-black bg-white border-base-300"
                                                                        onChange={(e) => setScores(prev => ({
                                                                            ...prev,
                                                                            [`${result._id}-${type}`]: e.target.value
                                                                        }))}
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleGradeSubmit(result._id, type)}
                                                                        className="btn btn-primary btn-sm btn-square rounded-lg shadow-lg shadow-primary/20"
                                                                    >
                                                                        <PiCheckBold />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="labs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                    >
                        <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-base-300 shadow-sm w-fit">
                            <select 
                                className="select select-sm border-none focus:ring-0 font-black text-[10px] uppercase tracking-widest"
                                value={filter.status}
                                onChange={(e) => setFilter({...filter, status: e.target.value})}
                            >
                                <option value="pending">Pending Review</option>
                                <option value="reviewed">Already Reviewed</option>
                            </select>
                            <div className="w-px h-6 bg-base-300" />
                            <select 
                                className="select select-sm border-none focus:ring-0 font-black text-[10px] uppercase tracking-widest"
                                value={filter.testType}
                                onChange={(e) => setFilter({...filter, testType: e.target.value})}
                            >
                                <option value="">All Skills</option>
                                <option value="writing">Writing</option>
                                <option value="speaking">Speaking</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* List Side */}
                            <div className={`${selectedSubmission ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4 h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar pr-2`}>
                                {submissions.length === 0 ? (
                                    <div className="card bg-white border border-base-300 p-20 flex flex-col items-center justify-center text-center space-y-4 rounded-[3rem]">
                                        <PiMagnifyingGlassFill className="text-6xl text-base-content/10" />
                                        <h3 className="text-xl font-black opacity-30 uppercase tracking-tighter">No Lab Submissions</h3>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                        {submissions.map((sub) => (
                                            <div 
                                                key={sub._id}
                                                onClick={() => setSelectedSubmission(sub)}
                                                className={`card p-6 border transition-all cursor-pointer group ${
                                                    selectedSubmission?._id === sub._id 
                                                    ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 rounded-[2.5rem]' 
                                                    : 'bg-white border-base-300 hover:border-primary/50 rounded-[2rem]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${selectedSubmission?._id === sub._id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                                            {sub.testType === 'writing' ? <PiNotePencilFill /> : <PiMicrophoneStageFill />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black leading-tight text-sm uppercase tracking-tight">{sub.userName}</h4>
                                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${selectedSubmission?._id === sub._id ? 'text-white/60' : 'text-slate-400'}`}>
                                                                {sub.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <PiArrowRightBold className={`opacity-0 group-hover:opacity-100 transition-all ${selectedSubmission?._id === sub._id ? 'text-white' : 'text-primary'}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Evaluation Side */}
                            {selectedSubmission && (
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="lg:col-span-8 space-y-8"
                                >
                                    <div className="card bg-white border border-base-300 rounded-[3.5rem] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-350px)]">
                                        <div className="px-10 py-6 border-b border-base-200 bg-base-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <PiUserCircleFill className="text-4xl text-primary" />
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight">{selectedSubmission.userName}</h3>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedSubmission.userEmail}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedSubmission(null)} className="btn btn-ghost btn-circle">
                                                <PiXCircleFill className="text-2xl text-slate-300" />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Attempt Content</h5>
                                                <div className="p-8 bg-base-50 border border-base-200 rounded-[2.5rem] text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-medium italic">
                                                    {selectedSubmission.content}
                                                </div>
                                            </div>

                                            {filter.status === 'pending' ? (
                                                <form onSubmit={handleReviewSubmit} className="space-y-8 pt-6 border-t border-base-200">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Numeric Score (0-100)</label>
                                                            <input 
                                                                type="number"
                                                                className="input input-bordered w-full rounded-2xl font-black focus:border-primary"
                                                                placeholder="e.g. 85"
                                                                value={reviewData.score}
                                                                onChange={(e) => setReviewData({...reviewData, score: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">IELTS Band Score</label>
                                                            <input 
                                                                type="text"
                                                                className="input input-bordered w-full rounded-2xl font-black focus:border-primary"
                                                                placeholder="e.g. 7.5"
                                                                value={reviewData.bandScore}
                                                                onChange={(e) => setReviewData({...reviewData, bandScore: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Professional Feedback</label>
                                                        <textarea 
                                                            className="textarea textarea-bordered w-full rounded-[2.5rem] h-32 font-medium focus:border-primary"
                                                            placeholder="Provide detailed constructive criticism..."
                                                            value={reviewData.feedback}
                                                            onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                                                        />
                                                    </div>
                                                    <button 
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="btn btn-primary btn-block rounded-2xl h-16 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                                                    >
                                                        {submitting ? <span className="loading loading-spinner" /> : "Submit Final Grade"}
                                                        <PiCheckCircleFill className="text-xl" />
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="space-y-8 pt-6 border-t border-base-200">
                                                    <div className="flex items-center gap-8">
                                                        <div className="flex flex-col items-center p-6 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 min-w-[100px]">
                                                            <span className="text-3xl font-black text-emerald-600">{selectedSubmission.score}%</span>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60 text-center">Score</span>
                                                        </div>
                                                        <div className="flex flex-col items-center p-6 bg-primary/10 rounded-[2rem] border border-primary/20 min-w-[100px]">
                                                            <span className="text-3xl font-black text-primary">{selectedSubmission.bandScore}</span>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 text-center">IELTS Band</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Instructor Evaluation</h5>
                                                        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] font-bold text-slate-600 italic leading-relaxed">
                                                            {selectedSubmission.feedback}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GradeSubmissions;
