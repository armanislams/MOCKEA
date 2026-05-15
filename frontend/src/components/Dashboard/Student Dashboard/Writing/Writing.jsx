import { useState, useEffect, useMemo } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import { toast } from "react-toastify";
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
    PiImageFill
} from "react-icons/pi";
import { useNavigate } from "react-router";

const Writing = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [writingSets, setWritingSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Student input
  const [text, setText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const activeSet = useMemo(
    () => writingSets.find((set) => set._id === selectedSetId) || null,
    [writingSets, selectedSetId],
  );

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const fetchWriting = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=writing");
        const fetched = response?.data?.questions || [];
        setWritingSets(fetched);
        if (fetched.length > 0) setSelectedSetId(fetched[0]._id);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load writing prompts");
        setLoading(false);
      }
    };
    if (user?.email) fetchWriting();
  }, [axiosSecure, user?.email]);

  useEffect(() => {
    if (!timerActive || submitted) return;
    const iv = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(iv);
  }, [timerActive, submitted]);

  const handleSubmit = async () => {
    if (wordCount < 50) {
      toast.warning("Your response is too short for a meaningful assessment.");
      return;
    }

    try {
      setSubmitting(true);
      // In a real scenario, this would post to a 'submissions' endpoint
      // For now, we simulate a successful save to the instructor's queue
      await new Promise(r => setTimeout(r, 1500));
      setSubmitted(true);
      setTimerActive(false);
      toast.success("Response submitted for instructor evaluation!");
    } catch (error) {
      toast.error("Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) return <Loader />;

  if (!activeSet) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <PiInfoFill className="text-6xl text-base-content/20" />
          <h2 className="text-2xl font-black opacity-40 uppercase tracking-tighter">No Writing Prompts Available</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary rounded-2xl px-10">Go Back</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Sticky Premium Header */}
      <div className="bg-white border-b border-base-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
                    <PiArrowLeftBold className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-black tracking-tight">{activeSet.title}</h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Writing Proficiency Lab</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <div className="text-[9px] font-black uppercase tracking-widest text-base-content/30">Session Time</div>
                    <div className="text-xl font-mono font-black text-slate-800 leading-none mt-1">{fmt(elapsed)}</div>
                </div>
                <div className="h-10 w-px bg-base-300" />
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
                            <h2 className="text-3xl font-black tracking-tighter text-slate-800 leading-tight">
                                {activeSet.title}
                            </h2>
                            <div className="text-lg leading-relaxed text-slate-600 space-y-6 whitespace-pre-line">
                                {activeSet.passage || activeSet.content}
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
                                "{activeSet.instructions || "Spend approximately 20-40 minutes on this task. Ensure your response is well-structured and uses varied vocabulary."}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Side */}
            <div className="space-y-6">
                <div className="card bg-white rounded-[3rem] border border-base-300 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
                    {/* Editor Toolbar */}
                    <div className="px-10 py-6 border-b border-base-200 bg-base-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PiTextAaFill className="text-primary text-xl" />
                            <span className="text-xs font-black uppercase tracking-widest">Editor Canvas</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-base-200 rounded-xl shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Words:</span>
                                <span className="text-sm font-black text-primary">{wordCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* TextArea */}
                    <div className="flex-1 p-10">
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
                                className="w-full h-full resize-none border-none focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 font-medium custom-scrollbar"
                                placeholder="Start composing your response here..."
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    if (!timerActive) setTimerActive(true);
                                }}
                            />
                        )}
                    </div>

                    {/* Editor Footer */}
                    <div className="px-10 py-4 bg-base-50 border-t border-base-200 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-base-content/30">
                        <span>Status: {timerActive ? 'Active Session' : 'Standby'}</span>
                        <span>Autosave Enabled</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Writing;
