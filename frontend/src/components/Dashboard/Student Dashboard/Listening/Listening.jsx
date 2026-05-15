import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Howl } from "howler";
import { 
    PiPlayCircleFill, 
    PiPauseCircleFill, 
    PiSpeakerHighFill, 
    PiSpeakerSlashFill,
    PiClockFill,
    PiCheckCircleFill,
    PiXCircleFill,
    PiHeadphonesFill,
    PiArrowRightBold,
    PiArrowLeftBold,
    PiArrowClockwiseBold,
    PiInfoFill,
    PiChartLineUpFill
} from "react-icons/pi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../../hooks/useAuth";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import Loader from "../../../Loader/Loader";
import { useNavigate } from "react-router";

const fmt = (s) => {
  if (!s || isNaN(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const Listening = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  /* --- Data State --- */
  const [listeningSets, setListeningSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});

  /* --- Audio State --- */
  const howlRef = useRef(null);
  const rafRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const activeSet = useMemo(
    () => listeningSets.find((set) => set._id === selectedSetId) || null,
    [listeningSets, selectedSetId],
  );

  /* --- Fetch Data --- */
  useEffect(() => {
    const fetchListening = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=listening");
        const fetched = response?.data?.questions || [];
        setListeningSets(fetched);
        if (fetched.length > 0) setSelectedSetId(fetched[0]._id);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load listening materials");
        setLoading(false);
      }
    };
    if (user?.email) fetchListening();
  }, [axiosSecure, user?.email]);

  /* --- Audio Logic --- */
  useEffect(() => {
    if (!activeSet?.audioUrl) return;

    if (howlRef.current) {
        howlRef.current.unload();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    }

    const sound = new Howl({
      src: [activeSet.audioUrl],
      html5: true,
      volume: volume,
      onload: () => {
        setIsLoaded(true);
        setDuration(sound.duration());
      },
      onend: () => {
        setIsPlaying(false);
        cancelAnimationFrame(rafRef.current);
      },
    });
    howlRef.current = sound;

    return () => {
      cancelAnimationFrame(rafRef.current);
      sound.unload();
    };
  }, [activeSet?.audioUrl, volume]);

  const tick = useCallback(() => {
    if (howlRef.current?.playing()) {
      const seek = howlRef.current.seek() || 0;
      setCurrentTime(seek);
      setProgress(howlRef.current.duration() ? (seek / howlRef.current.duration()) * 100 : 0);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const togglePlay = () => {
    if (!isLoaded) return;
    if (!testStarted) setTestStarted(true);
    if (isPlaying) {
      howlRef.current.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      howlRef.current.play();
      rafRef.current = requestAnimationFrame(tick);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!testStarted || submitted) return;
    const iv = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(iv);
  }, [testStarted, submitted]);

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    if (!activeSet || Object.keys(answers).length < activeSet.questions.length) {
      toast.warning("Please attempt all questions first");
      return;
    }

    try {
      setSubmitting(true);
      if (isPlaying) togglePlay();
      
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
      toast.error("Evaluation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (!activeSet) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <PiInfoFill className="text-6xl text-base-content/20" />
          <h2 className="text-2xl font-black opacity-40 uppercase tracking-tighter">No Listening Content Available</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary rounded-2xl px-10">Go Back</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-20">
      {/* Sticky Premium Player Bar */}
      <div className="bg-slate-950 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between gap-10">
            <div className="flex items-center gap-6">
                <button 
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-3xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    {isPlaying ? <PiPauseCircleFill /> : <PiPlayCircleFill />}
                </button>
                <div className="hidden md:block">
                    <h1 className="text-sm font-black tracking-tight leading-tight">{activeSet.title}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Listening Lab</span>
                        <span className="text-[10px] font-mono text-white/40">{fmt(currentTime)} / {fmt(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Visual Waveform Mockup */}
            <div className="flex-1 max-w-xl hidden lg:flex flex-col gap-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div 
                        className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Session Time</div>
                    <div className="text-xl font-mono font-black text-primary leading-none mt-1">{fmt(elapsed)}</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle text-white/40">
                    <PiArrowLeftBold className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Questions Section */}
            <div className="lg:col-span-8 space-y-10">
                <AnimatePresence>
                {submitted && result && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card bg-linear-to-br from-indigo-600 to-primary p-10 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-xl flex flex-col items-center justify-center border border-white/20">
                                <span className="text-3xl font-black">{result.score}%</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Score</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">Performance Verified</h2>
                                <p className="text-white/60 font-bold uppercase tracking-widest text-xs mt-1">
                                    {result.correctAnswers} Correct Modules of {result.totalQuestions} Questions
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }}
                            className="btn bg-white text-primary border-none rounded-2xl px-12 h-14 font-black shadow-xl"
                        >
                            <PiArrowClockwiseBold /> Retake Practice
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="card bg-white p-10 rounded-[3.5rem] border border-base-300 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 text-primary/5 text-9xl">
                        <PiHeadphonesFill />
                    </div>
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black tracking-tighter italic text-slate-800">Practice Modules</h2>
                            <span className="badge badge-primary px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Questions 1–{activeSet.questions.length}</span>
                        </div>

                        <div className="space-y-12">
                            {activeSet.questions.map((q, idx) => {
                                const evaluation = result?.evaluatedAnswers.find(a => a.questionId === q.id);
                                const isCorrect = evaluation?.isCorrect;

                                return (
                                    <div key={q.id} className={`group space-y-6 p-8 rounded-[2.5rem] transition-all border ${
                                        submitted 
                                        ? (isCorrect ? "bg-emerald-50/50 border-emerald-500/20" : "bg-red-50/50 border-red-500/20")
                                        : "bg-base-50/50 border-base-200 hover:border-primary/20"
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/30">Listen Carefully</span>
                                            </div>
                                            {submitted && (
                                                isCorrect ? <PiCheckCircleFill className="text-emerald-500 text-2xl" /> : <PiXCircleFill className="text-red-500 text-2xl" />
                                            )}
                                        </div>

                                        <p className="text-lg font-black text-slate-700 leading-tight">{q.question}</p>

                                        {q.options && q.options.length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {q.options.map((opt, oIdx) => (
                                                    <label 
                                                        key={oIdx}
                                                        className={`flex items-center gap-3 p-5 rounded-2xl border transition-all cursor-pointer ${
                                                            answers[q.id] === opt 
                                                            ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 font-bold" 
                                                            : "bg-white border-base-200 hover:border-primary/30"
                                                        }`}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            className="hidden"
                                                            name={q.id}
                                                            value={opt}
                                                            disabled={submitted}
                                                            onChange={() => handleAnswerChange(q.id, opt)}
                                                        />
                                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center p-1 ${answers[q.id] === opt ? "border-white" : "border-base-300"}`}>
                                                            {answers[q.id] === opt && <div className="w-full h-full rounded-full bg-white" />}
                                                        </span>
                                                        <span className="text-sm">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <input 
                                                    type="text"
                                                    disabled={submitted}
                                                    className="input input-bordered w-full h-14 rounded-2xl font-bold bg-white focus:border-primary text-lg"
                                                    placeholder="Enter your observation..."
                                                    value={answers[q.id] || ""}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                />
                                                {submitted && !isCorrect && (
                                                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                                                        <PiCheckCircleFill /> Correct Key: {q.correctAnswer}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!submitted && (
                            <button 
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn btn-primary btn-block rounded-[2rem] h-20 text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 mt-12 transition-all hover:scale-[1.02]"
                            >
                                {submitting ? <span className="loading loading-spinner" /> : "Finalize Assessment"}
                                <PiArrowRightBold />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="lg:col-span-4 space-y-8 sticky top-36">
                {/* Navigator */}
                <div className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-base-content/30 mb-6">Unit Navigator</h3>
                    <div className="grid grid-cols-5 gap-3">
                        {activeSet.questions.map((q, i) => (
                            <div 
                                key={q.id}
                                className={`w-full aspect-square rounded-xl border flex items-center justify-center text-xs font-black transition-all ${
                                    answers[q.id] ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-base-100 border-base-200 text-base-content/40"
                                }`}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Card */}
                <div className="card bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative">
                    <div className="absolute -bottom-10 -right-10 text-white/5 text-9xl">
                        <PiInfoFill />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <PiChartLineUpFill />
                            </div>
                            <h3 className="font-black tracking-tight leading-tight">Practice Intensity</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-xs font-bold text-white/60">
                                <span className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                                Audio is played only once in real exam.
                            </li>
                            <li className="flex items-start gap-3 text-xs font-bold text-white/60">
                                <span className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                                Spelling accuracy is mission critical.
                            </li>
                            <li className="flex items-start gap-3 text-xs font-bold text-white/60">
                                <span className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                                Follow word count limits strictly.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Listening;
