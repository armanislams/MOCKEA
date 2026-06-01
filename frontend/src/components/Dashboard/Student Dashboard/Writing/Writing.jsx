import { useState, useEffect, useMemo } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import useUserProfile from "../../../../hooks/useUserProfile.jsx";
import { toast } from "react-toastify";
import alerts from "../../../../utils/alerts";
import Loader from "../../../Loader/Loader.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
    PiPencilLineFill, 
    PiClockFill, 
    PiTextAaFill, 
    PiCheckCircleFill,
    PiInfoFill,
    PiArrowRightBold,
    PiArrowLeftBold,
    PiImageFill,
    PiMonitor
} from "react-icons/pi";
import { useNavigate } from "react-router";
import useTestIntegrity from "../../../../hooks/useTestIntegrity.jsx";
import FullscreenGate from "../../../Common/FullscreenGate.jsx";
import FullscreenWarningOverlay from "../../../Common/FullscreenWarningOverlay.jsx";

const Writing = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userData } = useUserProfile();
  const targetExam = userData?.targetExam || "IELTS";

  const [writingSets, setWritingSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Student input
  const [activeTab, setActiveTab] = useState("task1"); // "task1" or "task2"
  const [task1Text, setTask1Text] = useState("");
  const [task2Text, setTask2Text] = useState("");

  const text = useMemo(() => {
    return `--- TASK 1 (150 Words Requirement) ---\n${task1Text}\n\n--- TASK 2 (250 Words Requirement) ---\n${task2Text}`;
  }, [task1Text, task2Text]);

  const resetText = () => {
    setTask1Text("");
    setTask2Text("");
  };

  const handleTextChange = (val) => {
    if (activeTab === "task1") {
      setTask1Text(val);
    } else {
      setTask2Text(val);
    }
  };

  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [timerActive, setTimerActive] = useState(false);

  // Fullscreen & Gating States
  const [isStarted, setIsStarted] = useState(false);
  const { showWarning, setShowWarning, enterFullscreen, exitFullscreen } = useTestIntegrity(isStarted, submitted);

  const activeSet = useMemo(
    () => writingSets.find((set) => set._id === selectedSetId) || null,
    [writingSets, selectedSetId],
  );

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const wordCount1 = useMemo(() => task1Text.trim() ? task1Text.trim().split(/\s+/).filter(w => w.length > 0).length : 0, [task1Text]);
  const wordCount2 = useMemo(() => task2Text.trim() ? task2Text.trim().split(/\s+/).filter(w => w.length > 0).length : 0, [task2Text]);
  const currentWordCount = activeTab === "task1" ? wordCount1 : wordCount2;
  const currentTargetWords = activeTab === "task1" ? 150 : 250;

  useEffect(() => {
    const fetchWriting = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=writing");
        const fetched = response?.data?.questions || [];
        setWritingSets(fetched);
        // Auto-selection removed
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load writing prompts");
        setLoading(false);
      }
    };
    if (user?.email) fetchWriting();
  }, [axiosSecure, user?.email]);

  useEffect(() => {
    if (!timerActive || submitted || timeLeft <= 0) return;
    const iv = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(iv);
  }, [timerActive, submitted, timeLeft]);

  const handleSubmit = async () => {
    if (wordCount < 50) {
      toast.warning("Your response is too short for a meaningful assessment.");
      return;
    }

    try {
      if (!activeSet) {
        toast.error("Question set not loaded properly. Please refresh.");
        return;
      }
      setSubmitting(true);
      const response = await axiosSecure.post("/submissions/submit", {
        questionSetId: activeSet._id,
        testType: "writing",
        title: activeSet.title,
        content: text,
        userName: user?.displayName || "Student",
        userEmail: user?.email
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimerActive(false);
        toast.success("Response submitted for instructor evaluation!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitTest = async () => {
    if (submitted) {
      exitFullscreen();
      setIsStarted(false);
      setSelectedSetId("");
      resetText();
      setSubmitted(false);
      setTimerActive(false);
      return;
    }

    const hasAnswers = task1Text.trim() !== "" || task2Text.trim() !== "";
    const result = hasAnswers
      ? await alerts.confirmExitPractice("Writing Essay Composition")
      : await alerts.confirmCancelPractice("Writing Essay Composition");

    if (result.isConfirmed) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsStarted(false);

      if (hasAnswers && wordCount >= 50) {
        try {
          toast.info("Auto-submitting your essay response...");
          await axiosSecure.post("/submissions/submit", {
            questionSetId: activeSet._id,
            testType: "writing",
            title: activeSet.title,
            content: text,
            userName: user?.displayName || "Student",
            userEmail: user?.email
          });
          toast.success("Practice test auto-submitted successfully!");
        } catch (error) {
          console.error("Auto submit failed:", error);
          toast.error("Auto-submit failed");
        }
      } else {
        toast.info(hasAnswers ? "Response too short to submit. Exiting practice." : "No response entered. Exiting practice.");
      }

      setSelectedSetId("");
      resetText();
      setSubmitted(false);
      setTimerActive(false);
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) return <Loader />;

  if (!activeSet || !selectedSetId) {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-2 pb-20">
            <div className="text-center space-y-4 mb-16">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${
                    writingSets.length > 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                    <PiPencilLineFill /> {writingSets.length} Modules Available
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-slate-800">Select a <span className="text-primary italic">Writing Test</span></h2>
                <p className="text-slate-400 font-medium text-lg">Choose a standardized prompt to master your academic composition.</p>
            </div>

            {writingSets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto"
                >
                    <div className="card bg-white border-2 border-dashed border-base-300 p-16 rounded-[3rem] text-center space-y-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center justify-center text-4xl mx-auto">
                            ✍️
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight text-slate-800">
                                No Writing Prompts Yet
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                No writing content is available for your current exam track{" "}
                                <span className="font-black text-primary">({targetExam})</span>.
                                This could be because:
                            </p>
                        </div>
                        <ul className="text-left space-y-3 text-sm text-slate-500 font-medium">
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">1</span>
                                The admin hasn't uploaded any writing prompts for <strong>{targetExam}</strong> yet.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">2</span>
                                Your exam preference might not match the available content — try switching to <strong>IELTS</strong> or <strong>BOTH</strong>.
                            </li>
                        </ul>
                        <a
                            href="/dashboard/profile"
                            className="btn btn-primary btn-block rounded-2xl h-14 font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            Change Exam Preference →
                        </a>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {writingSets.map((set, idx) => (
                        <motion.div 
                            key={set._id}
                            whileHover={{ y: -10 }}
                            className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm hover:shadow-2xl hover:border-primary/30 cursor-pointer group transition-all"
                            onClick={() => setSelectedSetId(set._id)}
                        >
                            <div className="flex flex-col h-full space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                        <PiPencilLineFill />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-base-content/20">Unit {idx + 1}</span>
                                </div>
                                <h3 className="text-xl font-black group-hover:text-primary transition-colors">{set.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                                    <span className="flex items-center gap-1.5"><PiClockFill /> 60m</span>
                                    <span className="flex items-center gap-1.5"><PiTextAaFill /> 2 Tasks</span>
                                    {set.examType && (
                                        <span className={`badge badge-sm font-black ${
                                            set.examType === 'IELTS' ? 'badge-primary' :
                                            set.examType === 'PTE' ? 'badge-success' : 'badge-warning'
                                        }`}>{set.examType}</span>
                                    )}
                                </div>
                                <button className="btn btn-block rounded-2xl h-14 bg-slate-900 text-white border-none group-hover:bg-primary transition-all font-black uppercase tracking-widest text-xs">
                                    Start Composition
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
  }

  if (!isStarted) {
    return (
      <FullscreenGate 
        isStarted={isStarted}
        onStart={() => { setIsStarted(true); enterFullscreen(); }}
        onCancel={() => setSelectedSetId("")}
        title="Ready to Start?"
        description="This practice test will open in fullscreen mode. Ensure you are in a quiet environment."
        icon={PiPencilLineFill}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 pb-20 relative select-none" onContextMenu={e => e.preventDefault()}>
      <FullscreenWarningOverlay 
        isOpen={showWarning}
        onResume={() => { setShowWarning(false); enterFullscreen(); }}
        onExit={handleExitTest}
      />

      {/* Sticky Premium Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button onClick={handleExitTest} className="btn btn-ghost btn-circle text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <PiArrowLeftBold className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-800">{activeSet?.title}</h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Writing Practice</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Remaining Time</div>
                    <div className={`text-xl font-mono font-black leading-none mt-1 ${timeLeft < 300 ? 'text-red-500' : 'text-slate-800'}`}>
                        {fmt(timeLeft)}
                    </div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                {!submitted && (
                    <button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="btn btn-primary rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20"
                    >
                        {submitting ? <span className="loading loading-spinner" /> : "Submit Draft"}
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Prompt Side */}
            <div className="space-y-6">
                <div className="card bg-white p-10 rounded-[3rem] border border-base-300 shadow-sm h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <span className="badge badge-neutral p-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Official Prompt</span>
                            <PiClockFill className="text-xl text-base-content/20" />
                        </div>
                        
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                                {activeSet?.title}
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-500 font-medium leading-relaxed">
                                {activeSet?.content}
                            </div>
                        </div>

                        {activeSet.images?.length > 0 && (
                            <div className="grid gap-4 pt-6">
                                {activeSet.images.map((img, i) => (
                                    <div key={i} className="rounded-3xl overflow-hidden border border-base-200 bg-base-50 p-4">
                                        <img src={img} alt="Prompt Diagram" className="w-full h-auto" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Instructor's Guide</h4>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                "{activeSet?.instructions || "Spend approximately 20-40 minutes on this task. Ensure your response is well-structured and uses varied vocabulary."}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Side */}
            <div className="space-y-6">
                <div className="card bg-white rounded-[3rem] border border-base-300 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
                    {/* Editor Toolbar */}
                    <div className="px-10 py-6 border-b border-slate-200 bg-base-50/50 flex items-center justify-between">
                        <div className="flex bg-slate-200/60 p-1 rounded-2xl gap-1.5 shadow-inner">
                            <button 
                                onClick={() => setActiveTab("task1")}
                                className={`py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === "task1" 
                                    ? "bg-white text-slate-800 shadow-sm" 
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Task 1
                            </button>
                            <button 
                                onClick={() => setActiveTab("task2")}
                                className={`py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === "task2" 
                                    ? "bg-white text-slate-800 shadow-sm" 
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Task 2
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                currentWordCount >= currentTargetWords 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-orange-50 text-orange-600 border-orange-100"
                            }`}>
                                Words: {currentWordCount} / {currentTargetWords} Target
                            </div>
                        </div>
                    </div>

                    {/* TextArea */}
                    <div className="flex-1 p-10 flex flex-col">
                        {submitted ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full text-center space-y-6"
                            >
                                <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center text-4xl shadow-xl">
                                    <PiCheckCircleFill />
                                </div>
                                <div className="max-w-sm">
                                    <h3 className="text-2xl font-black tracking-tight">Submission Successful</h3>
                                    <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                                        Your response has been added to the instructor's queue. You will be notified once the grading is complete.
                                    </p>
                                </div>
                                <button onClick={() => navigate(-1)} className="btn btn-primary rounded-2xl px-10 font-black">Return to Dashboard</button>
                            </motion.div>
                        ) : (
                            <textarea 
                                className="w-full h-full resize-none border-none focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 font-medium custom-scrollbar focus:outline-none"
                                placeholder={
                                    activeTab === "task1" 
                                    ? "Write your Task 1 academic report here (minimum 150 words)..." 
                                    : "Write your Task 2 argumentative opinion essay here (minimum 250 words)..."
                                }
                                value={activeTab === "task1" ? task1Text : task2Text}
                                onChange={(e) => handleTextChange(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Editor Footer */}
                    <div className="px-10 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Status: {timerActive ? 'Active Session' : 'Standby'}</span>
                        <div className="flex items-center gap-4">
                            <span>Task 1: {wordCount1}w</span>
                            <span>Task 2: {wordCount2}w</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Writing;
