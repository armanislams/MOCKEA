import { useState, useEffect, useMemo } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import { toast } from "react-toastify";
import Loader from "../../../Loader/Loader.jsx";
import { motion } from "framer-motion";
import { 
    PiBookOpenFill, 
    PiCheckCircleFill, 
    PiXCircleFill, 
    PiArrowRightBold,
    PiClockFill,
    PiInfoFill,
    PiChartLineUpFill,
    PiArrowLeftBold
} from "react-icons/pi";
import { useNavigate } from "react-router";

const Reading = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [readingSets, setReadingSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes

  // Fetch reading data
  useEffect(() => {
    const fetchReading = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=reading");
        const fetchedSets = response?.data?.questions || [];
        setReadingSets(fetchedSets);
        // Removed auto-selection of the first set
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load reading materials");
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchReading();
    }
  }, [axiosSecure, user?.email]);

  // Countdown Logic
  useEffect(() => {
    if (!selectedSetId || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedSetId, submitted, timeLeft]);

  const fmtTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const activeSet = useMemo(
    () => readingSets.find((set) => set._id === selectedSetId) || null,
    [readingSets, selectedSetId],
  );

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(answers).length === 0) {
      toast.warning("Please answer at least one question.");
      return;
    }

    try {
      if (!activeSet) return;
      setSubmitting(true);
      const response = await axiosSecure.post("/questions/evaluate", {
        questionSetId: activeSet._id,
        answers,
      });

      if (response.data.success) {
        setResult(response.data);
        setSubmitted(true);
        toast.success("Assessment completed!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to evaluate answers");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (!activeSet || !selectedSetId) {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                    <PiBookOpenFill /> {readingSets.length} Modules Available
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-slate-800">Select a <span className="text-primary italic">Reading Lab</span></h2>
                <p className="text-slate-400 font-medium text-lg">Choose a comprehensive passage to sharpen your analytical skills.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {readingSets.map((set, idx) => (
                    <motion.div 
                        key={set._id}
                        whileHover={{ y: -10 }}
                        className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm hover:shadow-2xl hover:border-primary/30 cursor-pointer group transition-all"
                        onClick={() => setSelectedSetId(set._id)}
                    >
                        <div className="flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                    <PiBookOpenFill />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-base-content/20">Module {idx + 1}</span>
                            </div>
                            <h3 className="text-xl font-black group-hover:text-primary transition-colors">{set.title}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                                <span className="flex items-center gap-1.5"><PiClockFill /> 60m</span>
                                <span className="flex items-center gap-1.5"><PiChartLineUpFill /> {set.questions?.length} Qs</span>
                            </div>
                            <button className="btn btn-block rounded-2xl h-14 bg-slate-900 text-white border-none group-hover:bg-primary transition-all font-black uppercase tracking-widest text-xs">
                                Open Module
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-base-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedSetId("")} className="btn btn-ghost btn-circle">
                    <PiArrowLeftBold />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{activeSet?.title}</h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Reading Skill Lab</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {readingSets.length > 1 && (
                    <select 
                        className="select select-sm rounded-xl font-bold bg-base-100 border-base-300"
                        value={selectedSetId}
                        onChange={(e) => {
                            setSelectedSetId(e.target.value);
                            setAnswers({});
                            setSubmitted(false);
                            setResult(null);
                        }}
                    >
                        {readingSets.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                    </select>
                )}
                {!submitted && (
                    <div className={`badge ${timeLeft < 300 ? 'bg-red-500 text-white' : 'badge-neutral'} p-4 rounded-xl font-black flex gap-2 border-none`}>
                        <PiClockFill /> {fmtTime(timeLeft)}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {submitted && result && (
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card bg-linear-to-r from-primary to-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 mb-10 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl font-black backdrop-blur-md border border-white/20">
                        {result.score}%
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Practice Performance</h2>
                        <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-1">
                            {result.correctAnswers} Correct of {result.totalQuestions} Questions
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }}
                    className="btn bg-white text-primary border-none rounded-2xl px-10 font-black hover:bg-yellow-300 hover:text-black transition-all"
                >
                    Retake Practice
                </button>
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Passage Side */}
            <div className="lg:col-span-3 space-y-6">
                <div className="card bg-white p-10 rounded-[3rem] border border-base-300 shadow-sm h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-3xl font-black tracking-tight mb-8 text-slate-800">{activeSet.title}</h2>
                        <div 
                            dangerouslySetInnerHTML={{ __html: activeSet.passage }} 
                            className="text-lg leading-relaxed text-slate-600 text-justify"
                        />
                    </div>
                </div>
            </div>

            {/* Questions Side */}
            <div className="lg:col-span-2 space-y-6">
                <div className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black tracking-tight">Question Panel</h2>
                        <PiBookOpenFill className="text-2xl text-primary/20" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {activeSet.questions.map((q, idx) => {
                            const isCorrect = submitted && result?.evaluatedAnswers.find(a => a.questionId === q.id)?.isCorrect;
                            
                            return (
                                <div key={q.id} className={`space-y-4 p-6 rounded-3xl transition-all ${
                                    submitted 
                                    ? (isCorrect ? "bg-success/5 border border-success/20" : "bg-error/5 border border-error/20")
                                    : "bg-base-50/50 border border-base-200"
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-xl bg-white border border-base-300 flex items-center justify-center font-black text-sm shadow-sm">{idx + 1}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Question</span>
                                        </div>
                                        {submitted && (
                                            isCorrect ? <PiCheckCircleFill className="text-success text-xl" /> : <PiXCircleFill className="text-error text-xl" />
                                        )}
                                    </div>

                                    <p className="font-bold text-slate-700 leading-snug">{q.question}</p>

                                    {q.options && q.options.filter(opt => opt && opt.trim() !== "").length > 0 ? (
                                        <div className="grid gap-3">
                                            {q.options.filter(opt => opt && opt.trim() !== "").map((opt, oIdx) => (
                                                <label 
                                                    key={oIdx}
                                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                                        answers[q.id] === opt 
                                                        ? "bg-primary/10 border-primary text-primary font-bold shadow-md shadow-primary/10" 
                                                        : "bg-white border-base-200 hover:border-primary/30"
                                                    }`}
                                                >
                                                    <input 
                                                        type="radio" 
                                                        className="hidden"
                                                        name={q.id}
                                                        value={opt}
                                                        disabled={submitted}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    />
                                                    <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center p-1">
                                                        {answers[q.id] === opt && <div className="w-full h-full rounded-full bg-current" />}
                                                    </span>
                                                    <span className="text-sm">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <input 
                                                type="text" 
                                                disabled={submitted}
                                                className="input input-bordered w-full rounded-2xl font-bold bg-white focus:border-primary"
                                                placeholder="Type your answer here..."
                                                value={answers[q.id] || ""}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            />
                                            {submitted && !isCorrect && (
                                                <div className="text-[10px] font-black uppercase tracking-widest text-success mt-2 flex items-center gap-1">
                                                    <PiCheckCircleFill /> Correct: {q.correctAnswer}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!submitted && (
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="btn btn-primary btn-block rounded-3xl h-16 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                            >
                                {submitting ? <span className="loading loading-spinner" /> : "Verify Performance"}
                                <PiArrowRightBold />
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reading;
