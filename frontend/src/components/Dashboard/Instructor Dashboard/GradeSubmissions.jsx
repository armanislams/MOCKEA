import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import { parseFeedback } from "../../../utils/parseFeedback";
import { motion, AnimatePresence } from "framer-motion";
import {  
    PiCalendar,
    PiPencilLine,
    PiMicrophoneStage,
    PiCheckBold,
    PiFilesFill,
    PiSelectionAllFill,
    PiNotePencilFill,
    PiMicrophoneStageFill,
    PiUserCircleFill,
    PiXCircleFill,
    PiArrowRightBold,
    PiCheckCircleFill,
    PiMagnifyingGlassFill,
    PiClockFill
} from "react-icons/pi";
const parseSpeakingSubmission = (content) => {
    if (!content) return [];
    const parts = content.split(/(?=--- Part \d+)/);
    const parsed = [];
    
    parts.forEach(partText => {
        const titleMatch = partText.match(/--- (Part \d+[^\n]+) ---/);
        const title = titleMatch ? titleMatch[1] : "Speaking Part";
        
        const items = [];
        const lines = partText.split("\n");
        let currentItem = null;
        
        lines.forEach(line => {
            const cleanLine = line.trim();
            if ((cleanLine.startsWith("Q") && cleanLine.includes(":")) || cleanLine.startsWith("Cue Card:")) {
                if (currentItem) items.push(currentItem);
                const label = cleanLine.startsWith("Cue Card:") ? "Cue Card" : cleanLine.split(":")[0];
                const questionText = cleanLine.substring(cleanLine.indexOf(":") + 1).trim();
                currentItem = { label, question: questionText, audioUrl: "" };
            } else if (cleanLine.startsWith("Answer:")) {
                if (currentItem) {
                    currentItem.audioUrl = cleanLine.replace("Answer:", "").trim();
                }
            }
        });
        if (currentItem) items.push(currentItem);
        if (items.length > 0) {
            parsed.push({ title, items });
        }
    });
    return parsed;
};

const parseWritingSubmission = (content) => {
    if (!content) return { task1: "", task2: "" };
    if (content.includes("--- TASK 2")) {
        const match = content.match(/--- TASK 1.*---\n([\s\S]*?)\n\n--- TASK 2.*---\n([\s\S]*)/);
        if (match) {
            return { task1: match[1].trim(), task2: match[2].trim() };
        } else {
            const parts = content.split(/--- TASK 2.*---\n?/);
            const t1 = parts[0].replace(/--- TASK 1.*---\n?/, "").trim();
            const t2 = (parts[1] || "").trim();
            return { task1: t1, task2: t2 };
        }
    }
    return { task1: content.trim(), task2: "" };
};

const calculateIeltsBand = (scoresList) => {
    if (!scoresList || scoresList.length === 0) return 0;
    const avg = scoresList.reduce((sum, val) => sum + parseFloat(val || 0), 0) / scoresList.length;
    const integerPart = Math.floor(avg);
    const decimalPart = avg - integerPart;
    if (decimalPart < 0.25) {
        return integerPart;
    } else if (decimalPart < 0.75) {
        return integerPart + 0.5;
    } else {
        return integerPart + 1.0;
    }
};

const GradeSubmissions = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("mock-tests"); // 'mock-tests' or 'skill-labs'
    
    const navigate = useNavigate();
    const location = useLocation();

    /* --- Full Mock Test State --- */
    const [scores, setScores] = useState({});
    const [expandedMockResult, setExpandedMockResult] = useState(null);
    const [mockEvalDetail, setMockEvalDetail] = useState(null); // stores { resultId, sectionType, isGraded, result, section }
    const [mockReviewData, setMockReviewData] = useState({ 
        score: "", 
        feedback: "", 
        criteria: { ta: "", cc: "", fc: "", lr: "", gra: "", pr: "" } 
    });
    const [loadingEvalDetail, setLoadingEvalDetail] = useState(false);
    const [isEditingMockGrade, setIsEditingMockGrade] = useState(false);

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
            queryClient.invalidateQueries({ queryKey: ["all-mock-results"] });
        }
    });

    const handleOpenMockEval = async (resultId, sectionType, isGraded) => {
        try {
            setLoadingEvalDetail(true);
            const { data } = await axiosSecure.get(`/mock-tests/results/${resultId}`);
            if (data.success) {
                const section = data.result.sectionResults.find(s => s.sectionType === sectionType);
                setMockEvalDetail({
                    resultId,
                    sectionType,
                    isGraded,
                    result: data.result,
                    section
                });
                const parsed = parseFeedback(section?.feedback);
                setMockReviewData({
                    score: section?.score?.toString() || "",
                    feedback: parsed.comments || "",
                    criteria: parsed.criteria || { ta: "", cc: "", fc: "", lr: "", gra: "", pr: "" }
                });
                setIsEditingMockGrade(false);
            } else {
                toast.error("Failed to load submission details");
            }
        } catch (error) {
            toast.error("Error loading submission details");
        } finally {
            setLoadingEvalDetail(false);
        }
    };

    const handleMockReviewSubmit = async (e) => {
        e.preventDefault();
        
        const criteria = mockReviewData.criteria || {};
        const scoresList = [];
        if (mockEvalDetail.sectionType === 'writing') {
            scoresList.push(criteria.ta);
            scoresList.push(criteria.cc);
            scoresList.push(criteria.lr);
            scoresList.push(criteria.gra);
        } else {
            scoresList.push(criteria.fc);
            scoresList.push(criteria.lr);
            scoresList.push(criteria.gra);
            scoresList.push(criteria.pr);
        }

        // Validate that all 4 criteria are rated
        if (scoresList.some(s => s === "" || s === undefined || s === null)) {
            return toast.error("Please rate all 4 evaluation criteria");
        }

        const calculatedOverallScore = calculateIeltsBand(scoresList);
        const serializedFeedback = JSON.stringify({
            criteria,
            comments: mockReviewData.feedback
        });

        try {
            setSubmitting(true);
            const { data } = await axiosSecure.patch("/mock-tests/grade-section", {
                resultId: mockEvalDetail.resultId,
                sectionType: mockEvalDetail.sectionType,
                score: calculatedOverallScore,
                feedback: serializedFeedback
            });
            if (data.success) {
                toast.success("Section graded successfully");
                setMockEvalDetail(null);
                setMockReviewData({ 
                    score: "", 
                    feedback: "", 
                    criteria: { ta: "", cc: "", fc: "", lr: "", gra: "", pr: "" } 
                });
                queryClient.invalidateQueries({ queryKey: ["all-mock-results"] });
            } else {
                toast.error("Failed to submit grade");
            }
        } catch (error) {
            toast.error("Error grading section");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGradeSubmit = (resultId, sectionType) => {
        const score = scores[`${resultId}-${sectionType}`];
        if (!score) return toast.error("Please enter a score");
        gradeMutation.mutate({ resultId, sectionType, score: parseFloat(score) });
    };

    /* --- Skill Labs State & Query --- */
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [reviewData, setReviewData] = useState({ score: "", bandScore: "", feedback: "" });
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState({ status: "pending", testType: "" });

    const { 
        data: submissions = [], 
        refetch: fetchSubmissions 
    } = useQuery({
        queryKey: ["skill-submissions", filter.status, filter.testType],
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/submissions?status=${filter.status}&testType=${filter.testType}`);
            return data.submissions ?? [];
        },
        enabled: activeTab === "skill-labs"
    });

    useEffect(() => {
        if (location.state?.submissionId) {
            setActiveTab("skill-labs");
        }
    }, [location.state?.submissionId]);

    useEffect(() => {
        if (location.state?.submissionId && submissions.length > 0) {
            const found = submissions.find(sub => sub._id === location.state.submissionId);
            if (found) {
                setSelectedSubmission(found);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state?.submissionId, submissions, navigate, location.pathname]);

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
            {!selectedSubmission && (
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3">Academic Evaluation Hub</p>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                            Review <span className="text-primary italic">Center</span>
                        </h1>
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-white p-2 rounded-4xl border border-base-300 shadow-sm flex items-center gap-1">
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
            )}

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
                                                <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
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
                                            {(result.lockedBy && new Date(result.lockExpiresAt) > new Date() && result.lockedByEmail !== (user?.email || localStorage.getItem('user_email'))) && (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                                                    <PiClockFill className="animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Locked by {result.lockedByName || result.lockedByEmail?.split('@')[0]}</span>
                                                </div>
                                            )}
                                            {['writing', 'speaking'].map(type => {
                                                const section = result.sectionResults.find(s => s.sectionType === type);
                                                if (!section) return null;

                                                const currentUserEmail = user?.email || localStorage.getItem('user_email');
                                                const isLockedByOther = result.lockedBy && new Date(result.lockExpiresAt) > new Date() && result.lockedByEmail !== currentUserEmail;

                                                return (
                                                    <div key={type} className={`flex items-center gap-5 p-5 rounded-4xl border transition-all ${
                                                        section.isGraded ? "bg-emerald-50/50 border-emerald-500/20" : "bg-warning/5 border-warning/20 border-dashed"
                                                    }`}>
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${section.isGraded ? 'bg-emerald-500 text-white' : 'bg-warning/10 text-warning'}`}>
                                                            {type === 'writing' ? <PiPencilLine /> : <PiMicrophoneStage />}
                                                        </div>
                                                        <div className="flex flex-col min-w-[120px]">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{type}</span>
                                                            {section.isGraded ? (
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-lg font-black text-emerald-600">{section.score}</span>
                                                                    <button
                                                                        onClick={() => handleOpenMockEval(result._id, type, true)}
                                                                        className="btn btn-xs rounded-xl btn-ghost text-slate-400 hover:text-primary hover:bg-slate-100 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                                                                        title="View Evaluation"
                                                                    >
                                                                        👁 Review
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <button
                                                                        onClick={() => handleOpenMockEval(result._id, type, false)}
                                                                        disabled={isLockedByOther}
                                                                        className="btn btn-primary btn-sm rounded-xl px-4 font-black text-[10px] uppercase tracking-wider shadow-md shadow-primary/20"
                                                                    >
                                                                        Evaluate
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
                        {!selectedSubmission && (
                            <div className="flex items-center gap-4 bg-white p-4 rounded-4xl border border-base-300 shadow-sm w-fit">
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
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* List Side */}
                            {!selectedSubmission && (
                                <div className="lg:col-span-12 space-y-4 h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar pr-2">
                                    {submissions.length === 0 ? (
                                        <div className="card bg-white border border-base-300 p-20 flex flex-col items-center justify-center text-center space-y-4 rounded-[3rem]">
                                            <PiMagnifyingGlassFill className="text-6xl text-base-content/10" />
                                            <h3 className="text-xl font-black opacity-30 uppercase tracking-tighter">No Lab Submissions</h3>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                {submissions.map((sub) => {
                                                    const isLocked = sub.lockedBy && new Date(sub.lockExpiresAt) > new Date();
                                                    const currentUserEmail = user?.email || localStorage.getItem('user_email');
                                                    const isLockedByMe = sub.lockedByEmail === currentUserEmail;
                                                    const currentlyLockedByOther = isLocked && !isLockedByMe;

                                                    return (
                                                        <div 
                                                            key={sub._id}
                                                            onClick={() => !currentlyLockedByOther && setSelectedSubmission(sub)}
                                                            className={`card p-6 border transition-all cursor-pointer group relative overflow-hidden ${
                                                                selectedSubmission?._id === sub._id 
                                                                ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 rounded-[2.5rem]' 
                                                                : currentlyLockedByOther
                                                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed rounded-4xl'
                                                                : 'bg-white border-base-300 hover:border-primary/50 rounded-4xl'
                                                            }`}
                                                        >
                                                            {currentlyLockedByOther && (
                                                                <div className="absolute top-2 right-4 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                                    <PiClockFill className="animate-pulse" /> Locked by {sub.lockedByName || sub.lockedByEmail?.split('@')[0]}
                                                                </div>
                                                            )}
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
                                                                {!currentlyLockedByOther && (
                                                                    <PiArrowRightBold className={`opacity-0 group-hover:opacity-100 transition-all ${selectedSubmission?._id === sub._id ? 'text-white' : 'text-primary'}`} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Evaluation Side */}
                            {selectedSubmission && (
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="lg:col-span-12 space-y-8"
                                >
                                    <div className="card bg-white border border-base-300 rounded-[3.5rem] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-100px)]">
                                        <div className="px-10 py-6 border-b border-base-200 bg-base-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <PiUserCircleFill className="text-4xl text-primary" />
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight">{selectedSubmission.userName}</h3>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedSubmission.userEmail}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedSubmission(null)} 
                                                className="btn btn-ghost btn-sm rounded-xl font-black uppercase text-[10px] flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 transition-colors px-3 py-1.5"
                                            >
                                                <PiXCircleFill className="text-lg" /> Back to List
                                            </button>
                                        </div>
                                         <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                             {/* Left Pane: Student Submission Content (Scrollable) */}
                                             <div className="flex-1 overflow-y-auto p-10 border-r border-base-200 custom-scrollbar space-y-6">
                                                 <div className="flex items-center justify-between border-b pb-4 mb-4">
                                                     <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Submission</h5>
                                                     <span className="badge badge-primary font-black text-[9px] uppercase tracking-wider">{selectedSubmission.testType}</span>
                                                 </div>
                                                 
                                                 {selectedSubmission.testType === 'speaking' ? (
                                                     <div className="space-y-6">
                                                         {parseSpeakingSubmission(selectedSubmission.content).map((part, partIdx) => (
                                                             <div key={partIdx} className="space-y-3 col-span-full">
                                                                 <h5 className="text-[10px] font-black uppercase tracking-widest text-primary border-b pb-1 mt-2">{part.title}</h5>
                                                                 <div className="grid grid-cols-1 gap-4">
                                                                     {part.items.map((item, itemIdx) => (
                                                                         <div key={itemIdx} className="p-4 bg-base-50 border border-base-200 rounded-2xl space-y-2 shadow-inner">
                                                                             <span className="badge badge-primary font-black text-[8px] uppercase tracking-wider">{item.label}</span>
                                                                             <p className="text-xs font-bold text-slate-700 leading-tight">{item.question}</p>
                                                                             {item.audioUrl && (
                                                                                 <audio src={item.audioUrl} controls className="w-full rounded-lg" />
                                                                             )}
                                                                         </div>
                                                                     ))}
                                                                 </div>
                                                             </div>
                                                         ))}
                                                         {parseSpeakingSubmission(selectedSubmission.content).length === 0 && (
                                                             <p className="text-xs font-bold text-slate-400 italic">No recordings found.</p>
                                                         )}
                                                     </div>
                                                 ) : (() => {
                                                     const { task1, task2 } = parseWritingSubmission(selectedSubmission.content);
                                                     return (
                                                         <div className="space-y-6">
                                                             {task1 && (
                                                                 <div className="space-y-2">
                                                                     <h6 className="text-[10px] font-black uppercase tracking-widest text-primary">Task 1 Response</h6>
                                                                     <div className="p-6 bg-base-50 border border-base-200 rounded-2xl text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-medium shadow-inner">
                                                                         {task1}
                                                                     </div>
                                                                 </div>
                                                             )}
                                                             {task2 && (
                                                                 <div className="space-y-2">
                                                                     <h6 className="text-[10px] font-black uppercase tracking-widest text-primary">Task 2 Response</h6>
                                                                     <div className="p-6 bg-base-50 border border-base-200 rounded-2xl text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-medium shadow-inner">
                                                                         {task2}
                                                                     </div>
                                                                 </div>
                                                             )}
                                                         </div>
                                                     );
                                                 })()}
                                             </div>

                                             {/* Right Pane: Evaluation Form / Results (Scrollable) */}
                                             <div className="w-full md:w-96 overflow-y-auto p-10 bg-base-50/50 custom-scrollbar flex flex-col justify-between border-t md:border-t-0 md:border-l border-base-200">
                                                 <div className="space-y-6">
                                                     <div className="flex items-center justify-between border-b pb-4 mb-4">
                                                         <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Evaluation &amp; Feedback</h5>
                                                     </div>

                                                     {filter.status === 'pending' ? (
                                                         <form onSubmit={handleReviewSubmit} className="space-y-6">
                                                             <div className="grid grid-cols-2 gap-4">
                                                                 <div className="space-y-2">
                                                                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Score (0-100)</label>
                                                                     <input 
                                                                         type="number"
                                                                         className="input input-sm input-bordered w-full h-12 rounded-xl font-black focus:border-primary text-sm"
                                                                         placeholder="e.g. 85"
                                                                         value={reviewData.score}
                                                                         onChange={(e) => setReviewData({...reviewData, score: e.target.value})}
                                                                     />
                                                                 </div>
                                                                 <div className="space-y-2">
                                                                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">IELTS Band</label>
                                                                     <input 
                                                                         type="text"
                                                                         className="input input-sm input-bordered w-full h-12 rounded-xl font-black focus:border-primary text-sm"
                                                                         placeholder="e.g. 7.5"
                                                                         value={reviewData.bandScore}
                                                                         onChange={(e) => setReviewData({...reviewData, bandScore: e.target.value})}
                                                                     />
                                                                 </div>
                                                             </div>
                                                             <div className="space-y-2">
                                                                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Feedback</label>
                                                                 <textarea 
                                                                     className="textarea textarea-bordered w-full rounded-2xl h-44 font-medium focus:border-primary text-sm leading-relaxed"
                                                                     placeholder="Provide detailed constructive criticism..."
                                                                     value={reviewData.feedback}
                                                                     onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                                                                 />
                                                             </div>
                                                             <button 
                                                                 type="submit"
                                                                 disabled={submitting}
                                                                 className="btn btn-primary btn-block rounded-xl h-14 font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/25 mt-4"
                                                             >
                                                                 {submitting ? <span className="loading loading-spinner" /> : "Submit Review"}
                                                             </button>
                                                         </form>
                                                     ) : (
                                                         <div className="space-y-6">
                                                             <div className="grid grid-cols-2 gap-4">
                                                                 <div className="flex flex-col items-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                                     <span className="text-2xl font-black text-emerald-600">{selectedSubmission.score}%</span>
                                                                     <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60 text-center mt-1">Score</span>
                                                                 </div>
                                                                 <div className="flex flex-col items-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                                                     <span className="text-2xl font-black text-primary">{selectedSubmission.bandScore}</span>
                                                                     <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 text-center mt-1">IELTS Band</span>
                                                                 </div>
                                                             </div>
                                                             <div className="space-y-2">
                                                                 <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Instructor Feedback</h5>
                                                                 <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl font-semibold text-slate-600 italic text-sm leading-relaxed whitespace-pre-wrap">
                                                                     {selectedSubmission.feedback}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            {mockEvalDetail && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in">
                    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col w-full h-full max-w-7xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-10 py-6 border-b border-base-200 bg-base-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <PiUserCircleFill className="text-4xl text-primary" />
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">{mockEvalDetail.result.userId?.name || "Student"}</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mockEvalDetail.result.userId?.email}</p>
                                </div>
                                <div className="w-px h-6 bg-base-300 mx-2" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-600">{mockEvalDetail.result.testId?.title}</h4>
                                    <span className="badge badge-primary font-black text-[8px] uppercase tracking-wider mt-0.5">{mockEvalDetail.sectionType}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setMockEvalDetail(null)} 
                                className="btn btn-ghost btn-sm rounded-xl font-black uppercase text-[10px] flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 transition-colors px-3 py-1.5"
                            >
                                <PiXCircleFill className="text-lg" /> Close
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Left Pane: Student Submission & Questions (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-10 border-r border-base-200 custom-scrollbar space-y-6">
                                {mockEvalDetail.sectionType === 'writing' ? (() => {
                                    const writingQuestionData = mockEvalDetail.result.testId?.sections?.writing?.[0];
                                    const writingAnswer = mockEvalDetail.section.answers.find(ans => 
                                        ans.questionId === writingQuestionData?._id?.toString() ||
                                        ans.questionId === writingQuestionData?.id ||
                                        (ans.userAnswer && ans.userAnswer.includes("--- TASK 1"))
                                    );
                                    const { task1, task2 } = parseWritingSubmission(writingAnswer?.userAnswer);
                                    
                                    return (
                                        <div className="space-y-6">
                                            {/* Question Prompt */}
                                            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                                                <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question Prompt</h6>
                                                {writingQuestionData?.passage ? (
                                                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium text-sm" dangerouslySetInnerHTML={{ __html: writingQuestionData.passage }} />
                                                ) : (
                                                    <p className="text-slate-400 italic text-sm">No writing prompt found in test data.</p>
                                                )}
                                                {writingQuestionData?.images?.filter(img => img && img.trim() !== "").length > 0 && (
                                                    <div className="mt-4 grid gap-4">
                                                        {writingQuestionData.images.filter(img => img && img.trim() !== "").map((img, i) => (
                                                            <div key={i} className="rounded-xl overflow-hidden border border-slate-100 p-1 bg-white max-w-md">
                                                                <img src={img} alt={`Writing Task Diagram ${i + 1}`} className="w-full h-auto object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Student Responses */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <h6 className="text-[10px] font-black uppercase tracking-widest text-primary">Student Task 1 Response</h6>
                                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-medium shadow-inner">
                                                        {task1 || <span className="text-slate-400 italic text-sm">No Task 1 response submitted.</span>}
                                                    </div>
                                                    {task1 && (
                                                        <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            Words: {task1.trim() ? task1.trim().split(/\s+/).length : 0} / 150 Target
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <h6 className="text-[10px] font-black uppercase tracking-widest text-primary">Student Task 2 Response</h6>
                                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-medium shadow-inner">
                                                        {task2 || <span className="text-slate-400 italic text-sm">No Task 2 response submitted.</span>}
                                                    </div>
                                                    {task2 && (
                                                        <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            Words: {task2.trim() ? task2.trim().split(/\s+/).length : 0} / 250 Target
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : (() => {
                                    const speakingQuestionData = mockEvalDetail.result.testId?.sections?.speaking?.[0];
                                    const speakingAnswer = mockEvalDetail.section.answers.find(ans => 
                                        ans.questionId === speakingQuestionData?._id?.toString() ||
                                        ans.questionId === speakingQuestionData?.id ||
                                        (ans.userAnswer && (ans.userAnswer.includes("--- Part ") || ans.userAnswer.includes("Answer:")))
                                    );
                                    
                                    const parsedSpeakingParts = parseSpeakingSubmission(speakingAnswer?.userAnswer);
                                    
                                    // Align with speakingQuestionData
                                    const aligned = (() => {
                                        const findAudio = (partTitle, qText, qIndex) => {
                                            const part = parsedSpeakingParts.find(p => p.title.toLowerCase().includes(partTitle.toLowerCase()));
                                            if (!part) return null;
                                            const match = part.items.find(item => {
                                                const cleanItemQ = item.question.toLowerCase().replace(/[^a-z0-9]/g, "");
                                                const cleanTargetQ = (qText || "").split("\n")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
                                                return cleanItemQ === cleanTargetQ || item.label.includes((qIndex + 1).toString());
                                            });
                                            return match?.audioUrl || null;
                                        };
                                        return {
                                            part1: (speakingQuestionData?.speakingPart1Questions || []).map((q, idx) => ({
                                                question: q,
                                                audioUrl: findAudio("Part 1", q, idx)
                                            })),
                                            part2: {
                                                question: speakingQuestionData?.speakingPrompt || "Describe a historical building you have visited.",
                                                audioUrl: findAudio("Part 2", speakingQuestionData?.speakingPrompt || "", 0)
                                            },
                                            part3: (speakingQuestionData?.speakingPart3Questions || []).map((q, idx) => ({
                                                question: q,
                                                audioUrl: findAudio("Part 3", q, idx)
                                            }))
                                        };
                                    })();

                                    const hasConfiguredQuestions = (speakingQuestionData?.speakingPart1Questions?.length > 0 || speakingQuestionData?.speakingPrompt || speakingQuestionData?.speakingPart3Questions?.length > 0);

                                    if (!hasConfiguredQuestions && parsedSpeakingParts.length > 0) {
                                        return (
                                            <div className="space-y-6">
                                                {parsedSpeakingParts.map((part, partIdx) => (
                                                    <div key={partIdx} className="space-y-3 col-span-full">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary border-b pb-1 mt-2">{part.title}</h5>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {part.items.map((item, itemIdx) => (
                                                                <div key={itemIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-inner">
                                                                    <span className="badge badge-primary font-black text-[8px] uppercase tracking-wider">{item.label}</span>
                                                                    <p className="text-xs font-bold text-slate-700 leading-tight">{item.question}</p>
                                                                    {item.audioUrl ? (
                                                                        <audio src={item.audioUrl} controls className="w-full rounded-lg mt-2" />
                                                                    ) : (
                                                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic pt-1">No recording uploaded</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-6">
                                            {/* Part 1 */}
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary border-b pb-1 mt-2">Part 1: Interview</h5>
                                                {aligned.part1.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {aligned.part1.map((item, idx) => (
                                                            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-inner">
                                                                <span className="badge badge-primary font-black text-[8px] uppercase tracking-wider">Question {idx + 1}</span>
                                                                <p className="text-xs font-bold text-slate-700 leading-tight">{item.question}</p>
                                                                {item.audioUrl ? (
                                                                    <audio src={item.audioUrl} controls className="w-full rounded-lg mt-2" />
                                                                ) : (
                                                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic pt-1">No recording uploaded</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-400 italic">No Part 1 questions configured.</p>
                                                )}
                                            </div>

                                            {/* Part 2 */}
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary border-b pb-1 mt-2">Part 2: Cue Card Prompt</h5>
                                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-inner">
                                                    <span className="badge badge-primary font-black text-[8px] uppercase tracking-wider">Cue Card Topic</span>
                                                    <p className="text-xs font-bold text-slate-700 leading-tight whitespace-pre-wrap">{aligned.part2.question}</p>
                                                    {aligned.part2.audioUrl ? (
                                                        <audio src={aligned.part2.audioUrl} controls className="w-full rounded-lg mt-2" />
                                                    ) : (
                                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic pt-1">No recording uploaded</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Part 3 */}
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary border-b pb-1 mt-2">Part 3: Discussion</h5>
                                                {aligned.part3.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {aligned.part3.map((item, idx) => (
                                                            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-inner">
                                                                <span className="badge badge-primary font-black text-[8px] uppercase tracking-wider">Discussion Q{idx + 1}</span>
                                                                <p className="text-xs font-bold text-slate-700 leading-tight">{item.question}</p>
                                                                {item.audioUrl ? (
                                                                    <audio src={item.audioUrl} controls className="w-full rounded-lg mt-2" />
                                                                ) : (
                                                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic pt-1">No recording uploaded</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-400 italic">No Part 3 questions configured.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Right Pane: Evaluation Form / Results (Scrollable) */}
                            <div className="w-full md:w-96 overflow-y-auto p-10 bg-base-50/50 custom-scrollbar flex flex-col justify-between border-t md:border-t-0 md:border-l border-base-200">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Evaluation &amp; Feedback</h5>
                                    </div>

                                    {!mockEvalDetail.isGraded || isEditingMockGrade ? (() => {
                                        const ieltsScoreOptions = ["0", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];
                                        const isWriting = mockEvalDetail.sectionType === 'writing';
                                        
                                        return (
                                            <form onSubmit={handleMockReviewSubmit} className="space-y-6">
                                                <div className="space-y-3">
                                                    <h6 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detailed Criteria Scores</h6>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {isWriting ? (
                                                            <>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Task Achievement (TA)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.ta || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, ta: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Coherence/Cohesion (CC)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.cc || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, cc: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Lexical Resource (LR)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.lr || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, lr: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Grammar & Accuracy (GRA)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.gra || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, gra: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Fluency/Coherence (FC)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.fc || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, fc: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Lexical Resource (LR)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.lr || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, lr: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Grammar & Accuracy (GRA)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.gra || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, gra: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Pronunciation (PR)</label>
                                                                    <select 
                                                                        className="select select-bordered select-sm w-full rounded-xl font-black focus:border-primary text-xs h-10"
                                                                        value={mockReviewData.criteria?.pr || ""}
                                                                        onChange={(e) => setMockReviewData({
                                                                            ...mockReviewData,
                                                                            criteria: { ...mockReviewData.criteria, pr: e.target.value }
                                                                        })}
                                                                    >
                                                                        <option value="">Score</option>
                                                                        {ieltsScoreOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                                                    </select>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {(() => {
                                                    const scoresList = [];
                                                    const crit = mockReviewData.criteria || {};
                                                    if (isWriting) {
                                                        if (crit.ta) scoresList.push(crit.ta);
                                                        if (crit.cc) scoresList.push(crit.cc);
                                                        if (crit.lr) scoresList.push(crit.lr);
                                                        if (crit.gra) scoresList.push(crit.gra);
                                                    } else {
                                                        if (crit.fc) scoresList.push(crit.fc);
                                                        if (crit.lr) scoresList.push(crit.lr);
                                                        if (crit.gra) scoresList.push(crit.gra);
                                                        if (crit.pr) scoresList.push(crit.pr);
                                                    }
                                                    const hasAll = scoresList.length === 4 && scoresList.every(s => s !== "");
                                                    const calcBand = hasAll ? calculateIeltsBand(scoresList) : null;
                                                    return (
                                                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calculated Overall Band:</span>
                                                            <span className="text-xl font-black text-primary">{hasAll ? calcBand : "—"}</span>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Feedback</label>
                                                    <textarea 
                                                        className="textarea textarea-bordered w-full rounded-2xl h-44 font-medium focus:border-primary text-sm leading-relaxed"
                                                        placeholder="Provide detailed constructive criticism..."
                                                        value={mockReviewData.feedback}
                                                        onChange={(e) => setMockReviewData({...mockReviewData, feedback: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    {isEditingMockGrade && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setIsEditingMockGrade(false)}
                                                            className="btn btn-ghost flex-1 rounded-xl h-14 font-black uppercase tracking-[0.1em] text-xs border border-slate-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button 
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="btn btn-primary flex-2 btn-block rounded-xl h-14 font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/25"
                                                    >
                                                        {submitting ? <span className="loading loading-spinner" /> : "Submit Review"}
                                                    </button>
                                                </div>
                                            </form>
                                        );
                                    })() : (
                                        <div className="space-y-6">
                                            {(() => {
                                                const parsed = parseFeedback(mockEvalDetail.section.feedback);
                                                const crit = parsed.criteria;
                                                const comments = parsed.comments || mockEvalDetail.section.feedback;

                                                if (!crit) {
                                                    return (
                                                        <>
                                                            <div className="flex flex-col items-center p-6 bg-primary/10 rounded-2xl border border-primary/20">
                                                                <span className="text-3xl font-black text-primary">{mockEvalDetail.section.score}</span>
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 text-center mt-1">IELTS Band Score</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Instructor Feedback</h5>
                                                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl font-semibold text-slate-600 italic text-sm leading-relaxed whitespace-pre-wrap">
                                                                    {comments || "No feedback comments provided."}
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        <div className="flex flex-col items-center p-6 bg-primary/10 rounded-2xl border border-primary/20">
                                                            <span className="text-3xl font-black text-primary">{mockEvalDetail.section.score}</span>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 text-center mt-1">Overall IELTS Band</span>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h6 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Criteria Breakdown</h6>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {mockEvalDetail.sectionType === 'writing' ? (
                                                                    <>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.ta}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Task Response</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.cc}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Coherence</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.lr}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Lexical</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.gra}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Grammar</span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.fc}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Fluency</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.lr}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Lexical</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.gra}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Grammar</span>
                                                                        </div>
                                                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                                                            <span className="text-base font-black text-slate-800">{crit.pr}</span>
                                                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">Pronunciation</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Instructor Feedback</h5>
                                                            <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl font-semibold text-slate-600 italic text-sm leading-relaxed whitespace-pre-wrap">
                                                                {comments || "No feedback comments provided."}
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}

                                            <button
                                                onClick={() => {
                                                    const parsed = parseFeedback(mockEvalDetail.section.feedback);
                                                    setMockReviewData({
                                                        score: mockEvalDetail.section.score?.toString() || "",
                                                        feedback: parsed.comments || "",
                                                        criteria: parsed.criteria || { ta: "", cc: "", fc: "", lr: "", gra: "", pr: "" }
                                                    });
                                                    setIsEditingMockGrade(true);
                                                }}
                                                className="btn btn-outline btn-block rounded-xl h-12 font-black uppercase tracking-[0.1em] text-xs"
                                            >
                                                Edit Grade & Feedback
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loadingEvalDetail && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl flex flex-col items-center space-y-4 shadow-xl">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading Submission Details...</p>
                    </div>
                </div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default GradeSubmissions;
