import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import useUserProfile from "../../../../hooks/useUserProfile.jsx";
import useTestIntegrity from "../../../../hooks/useTestIntegrity.jsx";
import { toast } from "react-toastify";
import alerts from "../../../../utils/alerts";
import Loader from "../../../Loader/Loader.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiMicrophoneFill,
  PiMicrophoneStageFill,
  PiStopCircleFill,
  PiCheckCircleFill,
  PiInfoFill,
  PiArrowLeftBold,
  PiClockFill,
  PiWaveformFill,
  PiUserCircleFill,
  PiMonitor,
} from "react-icons/pi";
import { useNavigate } from "react-router";
import FullscreenGate from "../../../Common/FullscreenGate.jsx";
import FullscreenWarningOverlay from "../../../Common/FullscreenWarningOverlay.jsx";

const Speaking = ({ preloadedSet = null, onSubmitGuest = null }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userData } = useUserProfile();
  const targetExam = userData?.targetExam || "IELTS";

  const [speakingSets, setSpeakingSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [loading, setLoading] = useState(!preloadedSet); // skip loader if data already provided
  const [isRecording, setIsRecording] = useState(false);
  const [prepTime, setPrepTime] = useState(60); // 1 min prep
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPrepPhase, setIsPrepPhase] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

  // Fullscreen & Gating States
  const [isStarted, setIsStarted] = useState(false);
  const { showWarning, setShowWarning, enterFullscreen, exitFullscreen } = useTestIntegrity(isStarted, submitted);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);

  const activeSet = useMemo(
    () => preloadedSet || speakingSets.find((set) => set._id === selectedSetId) || null,
    [preloadedSet, speakingSets, selectedSetId],
  );

  // Real-time Canvas Soundwave Visualizer
  useEffect(() => {
    if (!mediaStream || !canvasRef.current) return;

    let audioCtx;
    let analyser;
    let source;
    let animationFrameId;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // high performance, clean bars
      
      source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const draw = () => {
        animationFrameId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.6;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize height to canvas dimension
          barHeight = (dataArray[i] / 255) * canvas.height * 0.75;
          if (barHeight < 4) barHeight = 4; // minimum height bar for aesthetic consistency

          // Violet to Pink linear gradient
          const gradient = ctx.createLinearGradient(0, (canvas.height - barHeight) / 2, 0, (canvas.height + barHeight) / 2);
          gradient.addColorStop(0, "#c084fc"); // purple-400
          gradient.addColorStop(0.5, "#ec4899"); // pink-500
          gradient.addColorStop(1, "#c084fc"); // purple-400

          ctx.fillStyle = gradient;

          const y = (canvas.height - barHeight) / 2;
          const radius = 3;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 2, barHeight, radius);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.error("Audio visualizer failed:", e);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioCtx && audioCtx.state !== "closed") audioCtx.close();
    };
  }, [mediaStream]);

  useEffect(() => {
    if (preloadedSet) return; // guest: data already provided, loading already false via useState(!preloadedSet)
    const fetchSpeaking = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=speaking");
        const fetched = response?.data?.questions || [];
        setSpeakingSets(fetched);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load speaking prompts");
        setLoading(false);
      }
    };
    if (user?.email) fetchSpeaking();
  }, [axiosSecure, user?.email, preloadedSet]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPrepPhase(false);
      setRecordingTime(0);
      toast.success("Recording Started! Speak clearly.");
    } catch (err) {
      toast.error("Microphone access denied. Please enable it to record.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info(
        "Recording captured. Ready for submission. Please submit your response.",
      );
    }
  }, [isRecording]);

  const startPrep = () => {
    setIsPrepPhase(true);
    setPrepTime(60);
    toast.info("1-Minute Preparation Time Started");
  };

  // Preparation Timer
  useEffect(() => {
    if (!isPrepPhase) return;

    const iv = setInterval(() => {
      setPrepTime((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          // Transition to recording phase
          setIsPrepPhase(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [isPrepPhase, startRecording]);

  // Recording Timer
  useEffect(() => {
    if (!isRecording) return;
    const iv = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    return () => clearInterval(iv);
  }, [isRecording]);

  const uploadToCloudinary = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUD_NAME);
    formData.append("resource_type", "video");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/video/upload`,
      formData,
    );

    return response.data.secure_url;
  };

  const handleExitTest = async () => {
    if (submitted) {
      exitFullscreen();
      setIsStarted(false);
      navigate(-1);
      return;
    }

    const result = await alerts.confirmExitPractice("Speaking Practice Interview");

    if (result.isConfirmed) {
      exitFullscreen();
      setIsStarted(false);

      // Guest mode - hand off directly to onSubmitGuest callback without uploading/saving to DB
      if (onSubmitGuest && !user?.email) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          setTimeout(() => {
            if (audioChunksRef.current.length > 0) {
              const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
              onSubmitGuest(blob);
              toast.success("Guest test submitted successfully!");
            } else {
              toast.info("No recording captured.");
            }
            navigate(-1);
          }, 600);
        } else if (audioBlob) {
          onSubmitGuest(audioBlob);
          toast.success("Guest test submitted successfully!");
          navigate(-1);
        } else {
          toast.info("No recording captured. Exiting practice.");
          navigate(-1);
        }
        return;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        setTimeout(async () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            try {
              setIsUploading(true);
              toast.info("Auto-submitting your audio response...");
              const cloudinaryUrl = await uploadToCloudinary(blob);
              await axiosSecure.post("/submissions/submit", {
                questionSetId: activeSet._id,
                testType: "speaking",
                title: activeSet.title,
                content: cloudinaryUrl,
                userName: user?.displayName || "Student",
                userEmail: user?.email,
              });
              toast.success("Practice test auto-submitted successfully!");
            } catch (e) {
              console.error("Auto submit failed:", e);
              toast.error("Auto-submit failed: No recording uploaded.");
            } finally {
              setIsUploading(false);
            }
          }
          navigate(-1);
        }, 600);
      } else if (audioBlob) {
        try {
          setIsUploading(true);
          toast.info("Auto-submitting your audio response...");
          const cloudinaryUrl = await uploadToCloudinary(audioBlob);
          await axiosSecure.post("/submissions/submit", {
            questionSetId: activeSet._id,
            testType: "speaking",
            title: activeSet.title,
            content: cloudinaryUrl,
            userName: user?.displayName || "Student",
            userEmail: user?.email,
          });
          toast.success("Practice test auto-submitted successfully!");
        } catch (e) {
          console.error("Auto submit failed:", e);
          toast.error("Auto-submit failed");
        } finally {
          setIsUploading(false);
        }
        navigate(-1);
      } else {
        toast.info("No recording captured. Exiting practice.");
        navigate(-1);
      }
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) return <Loader />;

  if (!activeSet || (!preloadedSet && !selectedSetId)) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-20">
        <div className="text-center space-y-4 mb-16">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${
            speakingSets.length > 0
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-amber-50 text-amber-600 border-amber-200"
          }`}>
            <PiMicrophoneStageFill /> {speakingSets.length} Sessions Available
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-800">
            Choose a <span className="text-primary italic">Speaking Test</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            Select a standardized prompt to begin your virtual interview.
          </p>
        </div>

        {speakingSets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="card bg-white border-2 border-dashed border-base-300 p-16 rounded-[3rem] text-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center justify-center text-4xl mx-auto">
                🎤
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-800">
                  No Speaking Sessions Yet
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  No speaking content is available for your current exam track{" "}
                  <span className="font-black text-primary">({targetExam})</span>.
                  This could be because:
                </p>
              </div>
              <ul className="text-left space-y-3 text-sm text-slate-500 font-medium">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">1</span>
                  The admin hasn't uploaded any speaking prompts for <strong>{targetExam}</strong> yet.
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
                    <span className="text-[9px] font-black uppercase tracking-widest text-base-content/20">
                      Session {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-black group-hover:text-primary transition-colors text-slate-800">
                    {set.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                    <span className="flex items-center gap-1.5"><PiClockFill /> 15m</span>
                    <span className="flex items-center gap-1.5"><PiMicrophoneFill /> Open Test</span>
                    {set.examType && (
                      <span className={`badge badge-sm font-black ${
                        set.examType === 'IELTS' ? 'badge-primary' :
                        set.examType === 'PTE' ? 'badge-success' : 'badge-warning'
                      }`}>{set.examType}</span>
                    )}
                  </div>
                  <button className="btn btn-block rounded-2xl h-14 bg-primary text-white border-none transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:bg-slate-900">
                    Start Interview
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
        onCancel={() => navigate(-1)}
        title="Ready to Start?"
        description="This practice test will open in fullscreen mode. Ensure you are in a quiet environment and your microphone is working."
        icon={PiMicrophoneStageFill}
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

      {/* Immersive Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleExitTest}
              className="btn btn-ghost btn-circle text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <PiArrowLeftBold className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                {activeSet.title}
              </h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Speaking Test Practice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isRecording && (
              <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-red-500">
                  Live Recording
                </span>
                <span className="text-lg font-mono font-black ml-2 text-slate-800">
                  {fmt(recordingTime)}
                </span>
              </div>
            )}
            <div className="h-10 w-px bg-slate-200" />
            {submitted ? (
              <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                <PiCheckCircleFill className="text-xl" /> Session Finalized
              </div>
            ) : (
              <button
                onClick={handleExitTest}
                disabled={isUploading}
                className="btn btn-primary rounded-2xl px-8 h-12 font-black border-none shadow-xl shadow-primary/20"
              >
                {isUploading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  "End Session"
                )}
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
                  <span className="badge badge-primary px-5 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em]">
                    Official Cue Card
                  </span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <PiClockFill />
                    <span className="text-xs font-bold uppercase">
                      2 Minutes Max
                    </span>
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
                      <div
                        key={i}
                        className="rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner"
                      >
                        <img
                          src={img}
                          alt="Cue Card Visual"
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-start gap-5">
                  <PiInfoFill className="text-primary text-3xl shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">
                      Examiner Instructions
                    </h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                      "
                      {activeSet.instructions ||
                        "You should speak for 1 to 2 minutes on this topic. You have one minute to prepare what you are going to say."}
                      "
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recording Interface Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="card bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-xl h-fit text-slate-800">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight text-slate-800">
                    Audio Studio
                  </h3>
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
                        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center animate-none">
                          <span className="text-3xl font-black font-mono text-primary">
                            {prepTime}s
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-800">
                          Preparation Phase
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Organize your thoughts
                        </p>
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
                          <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white text-5xl shadow-[0_0_50px_rgba(239,68,68,0.3)]">
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
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="w-full flex justify-center py-2">
                          <canvas
                            ref={canvasRef}
                            width={320}
                            height={80}
                            className="bg-slate-50 rounded-3xl border border-slate-200 shadow-inner"
                          />
                        </div>
                        <div className="text-5xl font-mono font-black text-slate-800">
                          {fmt(recordingTime)}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                          System Capturing Audio...
                        </p>
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
                      <div className="w-32 h-32 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-5xl text-slate-400">
                        <PiMicrophoneFill />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-800">Ready to Start?</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          Prepare for 60 seconds or start <br /> speaking
                          immediately.
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
                          className="btn btn-ghost rounded-2xl h-16 font-black text-xs uppercase tracking-widest border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                  Examiner Perspective
                </h4>
                <p className="text-sm font-black leading-tight italic">
                  "Fluency and coherence are key. Try to use complex structures
                  naturally."
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
