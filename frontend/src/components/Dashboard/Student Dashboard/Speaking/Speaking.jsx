import { useState, useEffect, useMemo, useRef } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import { toast } from "react-toastify";
import Loader from "../../../Loader/Loader.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
    PiMicrophoneFill, 
    PiMicrophoneStageFill,
    PiStopCircleFill, 
    PiPlayCircleFill, 
    PiCheckCircleFill,
    PiInfoFill,
    PiArrowRightBold,
    PiArrowLeftBold,
    PiClockFill,
    PiWaveformFill,
    PiUserCircleFill
} from "react-icons/pi";
import { useNavigate } from "react-router";

const Speaking = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [speakingSets, setSpeakingSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [prepTime, setPrepTime] = useState(60); // 1 min prep
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPrepPhase, setIsPrepPhase] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const activeSet = useMemo(
    () => speakingSets.find((set) => set._id === selectedSetId) || null,
    [speakingSets, selectedSetId],
  );

  useEffect(() => {
    const fetchSpeaking = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=speaking");
        const fetched = response?.data?.questions || [];
        setSpeakingSets(fetched);
        // Auto-selection removed
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load speaking prompts");
        setLoading(false);
      }
    };
    if (user?.email) fetchSpeaking();
  }, [axiosSecure, user?.email]);

  // Preparation Timer
  useEffect(() => {
    if (!isPrepPhase || prepTime <= 0) {
        if (prepTime === 0 && isPrepPhase) {
            setIsPrepPhase(false);
            startRecording();
        }
        return;
    }
    const iv = setInterval(() => setPrepTime(p => p - 1), 1000);
    return () => clearInterval(iv);
  }, [isPrepPhase, prepTime]);

  // Recording Timer
  useEffect(() => {
    if (!isRecording) return;
    const iv = setInterval(() => setRecordingTime(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, [isRecording]);

  const startPrep = () => {
    setIsPrepPhase(true);
    setPrepTime(60);
    toast.info("1-Minute Preparation Time Started");
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPrepPhase(false);
    setRecordingTime(0);
    toast.success("Recording Started! Speak clearly.");
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast.info("Recording saved for evaluation.");
  };

  const handleSubmit = async () => {
    try {
      // In a real flow, we would upload the audio blob to S3/Cloudinary first
      // For this practice lab, we're wiring the submission structure
      const response = await axiosSecure.post("/submissions/submit", {
        questionSetId: activeSet._id,
        testType: "speaking",
        title: activeSet.title,
        content: "Audio Recording Session - [Simulated Audio Link]",
        userName: user?.displayName || "Student",
        userEmail: user?.email
      });

      if (response.data.success) {
        setSubmitted(true);
        toast.success("Speaking session submitted for instructor review!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit session");
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
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center space-y-4 mb-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 backdrop-blur-md">
                    <PiMicrophoneStageFill /> {speakingSets.length} Sessions Available
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-slate-800">Choose a <span className="text-primary italic">Speaking Lab</span></h2>
                <p className="text-slate-400 font-medium text-lg">Select a standardized prompt to begin your virtual interview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {speakingSets.map((set, idx) => (
                    <motion.div 
                        key={set._id}
                        whileHover={{ y: -10 }}
                        className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm hover:shadow-2xl hover:border-primary/30 cursor-pointer group transition-all"
                        onClick={() => setSelectedSetId(set._id)}
                    >
                        <div className="flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                    <PiMicrophoneStageFill />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-base-content/20">Session {idx + 1}</span>
                            </div>
                            <h3 className="text-xl font-black group-hover:text-primary transition-colors text-slate-800">{set.title}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                                <span className="flex items-center gap-1.5"><PiClockFill /> 15m</span>
                                <span className="flex items-center gap-1.5"><PiMicrophoneFill /> Open Lab</span>
                            </div>
                            <button className="btn btn-block rounded-2xl h-14 bg-primary text-white border-none transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:bg-slate-900">
                                Start Interview
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Immersive Header */}
      <div className="bg-white/5 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle text-white/40">
                    <PiArrowLeftBold className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-black tracking-tight">{activeSet.title}</h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Speaking Lab Session</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {isRecording && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/30">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-red-500">Live Recording</span>
                        <span className="text-lg font-mono font-black ml-2">{fmt(recordingTime)}</span>
                    </div>
                )}
                <div className="h-10 w-px bg-white/10" />
                {submitted ? (
                    <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                        <PiCheckCircleFill className="text-xl" /> Session Finalized
                    </div>
                ) : (
                    <button 
                        onClick={handleSubmit} 
                        disabled={isRecording}
                        className="btn btn-primary rounded-2xl px-8 h-12 font-black border-none shadow-xl shadow-primary/20"
                    >
                        End Session
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Cue Card Side */}
            <div className="lg:col-span-7 space-y-8">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="card bg-white p-12 rounded-[4rem] text-slate-900 shadow-2xl relative overflow-hidden h-fit"
                >
                    <div className="absolute top-0 right-0 p-12 text-slate-100 text-9xl -mr-10 -mt-10">
                        <PiMicrophoneStageFill />
                    </div>
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <span className="badge badge-primary px-5 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em]">Official Cue Card</span>
                            <div className="flex items-center gap-2 text-slate-400">
                                <PiClockFill />
                                <span className="text-xs font-bold uppercase">2 Minutes Max</span>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-4xl font-black tracking-tighter text-slate-800 leading-tight">
                                {activeSet.title}
                            </h2>
                            <div className="text-xl leading-relaxed text-slate-600 space-y-6 pt-4 font-medium italic">
                                {activeSet.passage || activeSet.content}
                            </div>
                        </div>

                        {activeSet.images?.length > 0 && (
                            <div className="grid gap-6 pt-6">
                                {activeSet.images.map((img, i) => (
                                    <div key={i} className="rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner">
                                        <img src={img} alt="Cue Card Visual" className="w-full h-auto" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-start gap-5">
                            <PiInfoFill className="text-primary text-3xl shrink-0" />
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Examiner Instructions</h4>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                    "{activeSet.instructions || "You should speak for 1 to 2 minutes on this topic. You have one minute to prepare what you are going to say."}"
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recording Interface Side */}
            <div className="lg:col-span-5 space-y-8">
                <div className="card bg-white/5 border border-white/10 p-10 rounded-[3.5rem] backdrop-blur-xl h-fit">
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight">Audio Studio</h3>
                            <PiWaveformFill className="text-2xl text-primary animate-pulse" />
                        </div>

                        {/* Prep Phase */}
                        <AnimatePresence mode="wait">
                            {isPrepPhase ? (
                                <motion.div 
                                    key="prep"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="flex flex-col items-center text-center space-y-6 py-10"
                                >
                                    <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin flex items-center justify-center p-2">
                                        <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center animate-none">
                                            <span className="text-3xl font-black font-mono text-primary">{prepTime}s</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black">Preparation Phase</h4>
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Organize your thoughts</p>
                                    </div>
                                    <button 
                                        onClick={startRecording}
                                        className="btn btn-primary rounded-2xl px-10 h-14 font-black w-full"
                                    >
                                        Skip Prep & Record
                                    </button>
                                </motion.div>
                            ) : isRecording ? (
                                <motion.div 
                                    key="recording"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center text-center space-y-10 py-10"
                                >
                                    <div className="relative">
                                        <div className="w-40 h-40 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                                                <PiMicrophoneFill />
                                            </div>
                                        </div>
                                        {/* Waveform Animation Placeholder */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div 
                                                    key={i}
                                                    className="absolute w-full h-full rounded-full border border-red-500/20"
                                                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-5xl font-mono font-black">{fmt(recordingTime)}</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">System Capturing Audio...</p>
                                    </div>

                                    <button 
                                        onClick={stopRecording}
                                        className="btn btn-error btn-outline rounded-2xl px-12 h-16 font-black w-full border-2"
                                    >
                                        <PiStopCircleFill className="text-2xl" /> Stop Recording
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center text-center space-y-8 py-10"
                                >
                                    <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-5xl text-white/20">
                                        <PiMicrophoneFill />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black">Ready to Start?</h4>
                                        <p className="text-xs font-bold text-white/40 leading-relaxed">
                                            Prepare for 60 seconds or start <br /> speaking immediately.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 w-full gap-4">
                                        <button 
                                            onClick={startPrep}
                                            className="btn btn-primary rounded-2xl h-16 font-black text-sm uppercase tracking-widest"
                                        >
                                            Start Prep Time
                                        </button>
                                        <button 
                                            onClick={startRecording}
                                            className="btn btn-ghost rounded-2xl h-16 font-black text-xs uppercase tracking-widest border border-white/10"
                                        >
                                            Record Immediately
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Examiner Widget */}
                <div className="card bg-primary p-8 rounded-[3rem] text-white flex flex-row items-center gap-5 shadow-2xl shadow-primary/20">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl backdrop-blur-md">
                        <PiUserCircleFill />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Examiner Perspective</h4>
                        <p className="text-sm font-black leading-tight italic">
                            "Fluency and coherence are key. Try to use complex structures naturally."
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Speaking;
