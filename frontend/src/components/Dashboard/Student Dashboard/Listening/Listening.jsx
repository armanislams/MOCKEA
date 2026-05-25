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
    PiChartLineUpFill,
    PiMonitor
} from "react-icons/pi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../../hooks/useAuth";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import Loader from "../../../Loader/Loader";
import { useNavigate } from "react-router";
import useTestIntegrity from "../../../../hooks/useTestIntegrity";
import FullscreenGate from "../../../Common/FullscreenGate";
import FullscreenWarningOverlay from "../../../Common/FullscreenWarningOverlay";

const fmt = (s) => {
  if (!s || isNaN(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const Listening = ({ preloadedSet = null, onSubmitGuest = null }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  /* --- Data State --- */
  const [listeningSets, setListeningSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [loading, setLoading] = useState(!preloadedSet); // skip loader if data already provided
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});

  // Fullscreen & Gating States
  const [isStarted, setIsStarted] = useState(false);
  const { showWarning, setShowWarning, enterFullscreen } = useTestIntegrity(isStarted, submitted);

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

  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for listening

  const activeSet = useMemo(
    () => preloadedSet || listeningSets.find((set) => set._id === selectedSetId) || null,
    [preloadedSet, listeningSets, selectedSetId],
  );

  /* --- Fetch Data --- */
  useEffect(() => {
    if (preloadedSet) return; // guest: data already provided, loading already false via useState(!preloadedSet)
    const fetchListening = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=listening");
        const fetched = response?.data?.questions || [];
        setListeningSets(fetched);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load listening materials");
        setLoading(false);
      }
    };
    if (user?.email) fetchListening();
  }, [axiosSecure, user?.email, preloadedSet]);

  // Countdown Logic — uses activeSet (works for both guests with preloadedSet and authenticated users)
  useEffect(() => {
    if (!activeSet || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSet, submitted, timeLeft]);

  const fmtCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

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

  const handleEvaluate = async () => {
    if (Object.keys(answers).length === 0) {
        toast.warning("Please answer at least one question.");
        return;
    }

    // Guest mode — hand off to parent handler (only if not yet logged in)
    if (onSubmitGuest && !user?.email) {
      onSubmitGuest(answers);
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
      toast.error("Evaluation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitTest = async () => {
    const result = await Swal.fire({
      title: "Exit and Auto-Submit?",
      text: "Are you sure? This will finalize your practice test and automatically submit your answers for evaluation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Exit and Submit",
      cancelButtonText: "Resume Practice",
      background: "#ffffff",
      customClass: {
        container: "z-[99999]",
        popup: "rounded-[2rem]",
        confirmButton: "rounded-xl px-8 py-3 font-bold",
        cancelButton: "rounded-xl px-8 py-3 font-bold"
      }
    });

    if (result.isConfirmed) {
      exitFullscreen();
      setIsStarted(false);

      if (Object.keys(answers).length > 0) {
        try {
          toast.info("Auto-evaluating your answers...");
          const response = await axiosSecure.post("/questions/evaluate", {
            questionSetId: activeSet._id,
            answers,
          });
          if (response.data.success) {
            toast.success("Practice test auto-submitted successfully!");
          }
        } catch (error) {
          console.error("Auto submit failed:", error);
          toast.error("Auto-submit failed");
        }
      } else {
        toast.info("No answers entered. Exiting practice.");
      }

      if (preloadedSet) {
        navigate(-1);
      } else {
        setSelectedSetId("");
        setAnswers({});
        setSubmitted(false);
        setResult(null);
      }
    }
  };

  if (loading) return <Loader />;

  if (!activeSet || (!preloadedSet && !selectedSetId)) {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-2 pb-20">
            <div className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                    <PiHeadphonesFill /> {listeningSets.length} Modules Available
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-slate-800">Choose a <span className="text-primary italic">Listening Module</span></h2>
                <p className="text-slate-400 font-medium text-lg">Select a standardized unit to begin your immersive training.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listeningSets.map((set, idx) => (
                    <motion.div 
                        key={set._id}
                        whileHover={{ y: -10 }}
                        className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm hover:shadow-2xl hover:border-primary/30 cursor-pointer group transition-all"
                        onClick={() => setSelectedSetId(set._id)}
                    >
                        <div className="flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                    <PiHeadphonesFill />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-base-content/20">Unit {idx + 1}</span>
                            </div>
                            <h3 className="text-xl font-black group-hover:text-primary transition-colors">{set.title}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                                <span className="flex items-center gap-1.5"><PiClockFill /> 30m</span>
                                <span className="flex items-center gap-1.5"><PiChartLineUpFill /> {set.questions?.length} Qs</span>
                            </div>
                            <button className="btn btn-block rounded-2xl h-14 bg-slate-900 text-white border-none group-hover:bg-primary transition-all font-black uppercase tracking-widest text-xs">
                                Start Lab
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
  }

  if (!isStarted) {
    return (
      <FullscreenGate 
        isStarted={isStarted}
        onStart={() => { setIsStarted(true); enterFullscreen(); }}
        onCancel={() => preloadedSet ? navigate(-1) : setSelectedSetId("")}
        title="Ready to Start?"
        description="This practice test will open in fullscreen mode. Ensure you are in a quiet environment and have headphones/speakers ready."
        icon={PiHeadphonesFill}
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

      {/* Minimal Sticky Nav Bar */}
      <div className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleExitTest}
                    className="btn btn-ghost btn-circle text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                    <PiArrowLeftBold className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-sm font-black tracking-tight leading-tight text-slate-800">{activeSet?.title}</h1>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Listening Practice</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time Left</div>
                <div className={`text-lg font-mono font-black ${timeLeft < 300 ? 'text-red-500' : 'text-primary'}`}>
                    {fmtCountdown(timeLeft)}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Audio Player + Questions */}
            <div className="lg:col-span-8 space-y-8">

                {/* ── Rich Inline Audio Player ─────────────────────────── */}
                <motion.div
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="card bg-white border border-slate-200 p-8 rounded-[3rem] shadow-xl overflow-hidden relative"
                >
                    <div className="relative z-10 space-y-6">
                        {/* Title row */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">Now Playing</p>
                                <h2 className="text-xl font-black tracking-tight text-slate-800">{activeSet?.title}</h2>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div
                                className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative cursor-pointer group"
                                onClick={(e) => {
                                    if (!howlRef.current || !duration) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = (e.clientX - rect.left) / rect.width;
                                    howlRef.current.seek(pct * duration);
                                }}
                            >
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-primary rounded-full shadow-[0_0_16px_rgba(99,102,241,0.3)] group-hover:bg-indigo-400 transition-colors"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ ease: 'linear', duration: 0.3 }}
                                />
                                {/* Thumb dot */}
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg border border-white"
                                    animate={{ left: `calc(${progress}% - 8px)` }}
                                    transition={{ ease: 'linear', duration: 0.3 }}
                                />
                            </div>
                            {/* Time labels */}
                            <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                                <span>{fmt(currentTime)}</span>
                                <span>{fmt(duration)}</span>
                            </div>
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={togglePlay}
                                disabled={!isLoaded}
                                className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isPlaying ? <PiPauseCircleFill /> : <PiPlayCircleFill />}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-3 flex-1">
                                <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                    {isMuted || volume === 0 ? <PiSpeakerSlashFill className="text-xl" /> : <PiSpeakerHighFill className="text-xl" />}
                                </button>
                                <input
                                    type="range" min="0" max="1" step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        const v = parseFloat(e.target.value);
                                        setVolume(v);
                                        setIsMuted(v === 0);
                                        if (howlRef.current) howlRef.current.volume(v);
                                    }}
                                    className="w-28 accent-primary cursor-pointer"
                                />
                            </div>

                            {/* Stats pills */}
                            <div className="flex items-center gap-3 ml-auto">
                                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Elapsed</p>
                                    <p className="text-sm font-mono font-black text-slate-700">{fmt(elapsed)}</p>
                                </div>
                                <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Duration</p>
                                    <p className="text-sm font-mono font-black text-primary">{fmt(duration)}</p>
                                </div>
                            </div>
                        </div>

                        {!activeSet?.audioUrl ? (
                            <p className="text-[11px] text-amber-500/80 font-bold text-center">
                                ⚠ No audio URL configured for this test.
                            </p>
                        ) : !isLoaded ? (
                            <p className="text-[11px] text-slate-400 font-bold text-center animate-pulse">
                                Loading audio...
                            </p>
                        ) : null}
                    </div>
                </motion.div>
                {/* ─────────────────────────────────────────────────────── */}

                <AnimatePresence>
                {submitted && result && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card bg-linear-to-br from-indigo-600 to-primary p-10 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 rounded-4xl bg-white/10 backdrop-blur-xl flex flex-col items-center justify-center border border-white/20">
                                <span className="text-3xl font-black">{result.score}%</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Score</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">Performance Verified</h2>
                                <p className="text-white/60 font-bold uppercase tracking-widest text-xs mt-1">
                                    {result.correctAnswers} Correct of {result.totalQuestions} Questions
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

                                        {q.options && q.options.filter(opt => opt && opt.trim() !== "").length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {q.options.filter(opt => opt && opt.trim() !== "").map((opt, oIdx) => (
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
                                onClick={handleEvaluate}
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
