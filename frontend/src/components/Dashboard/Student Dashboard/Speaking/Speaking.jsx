import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import useUserProfile from "../../../../hooks/useUserProfile.jsx";
import useTestIntegrity from "../../../../hooks/useTestIntegrity.jsx";
import { toast } from "react-toastify";
import alerts from "../../../../utils/alerts";
import Swal from "sweetalert2";
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
} from "react-icons/pi";
import { useNavigate } from "react-router";
import FullscreenGate from "../../../Common/FullscreenGate.jsx";
import FullscreenWarningOverlay from "../../../Common/FullscreenWarningOverlay.jsx";

const defaultPart1Questions = [
  "Do you work or study?",
  "What do you like most about your home town?",
  "How do you usually spend your weekends?",
  "What is your favorite type of music or movie?"
];

const defaultPart3Questions = [
  "Why do you think protecting historic structures or old buildings is important?",
  "How do buildings of the past differ from modern architectural designs?",
  "What kind of buildings or homes do you think people will live in in the future?"
];

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
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

  // 3-Part Speaking States
  const [speakingStep, setSpeakingStep] = useState(1); // 1, 2, or 3
  const [part1Blob, setPart1Blob] = useState(null);
  const [part2Blob, setPart2Blob] = useState(null);
  const [part3Blob, setPart3Blob] = useState(null);

  // Fullscreen & Gating States
  const [isStarted, setIsStarted] = useState(false);
  const { showWarning, setShowWarning, enterFullscreen, exitFullscreen } = useTestIntegrity(isStarted, submitted);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const recordingTimeRef = useRef(0);

  // Sync recordingTime to ref to avoid stale closure in callbacks
  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  const activeSet = useMemo(
    () => preloadedSet || speakingSets.find((set) => set._id === selectedSetId) || null,
    [preloadedSet, speakingSets, selectedSetId],
  );

  const activeBlob = useMemo(() => {
    if (speakingStep === 1) return part1Blob;
    if (speakingStep === 2) return part2Blob;
    if (speakingStep === 3) return part3Blob;
    return null;
  }, [speakingStep, part1Blob, part2Blob, part3Blob]);

  const activeAudioUrl = useMemo(() => {
    if (!activeBlob) return null;
    return URL.createObjectURL(activeBlob);
  }, [activeBlob]);

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
      // eslint-disable-next-line no-unused-vars
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
        if (recordingTimeRef.current > 0) {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (speakingStep === 1) setPart1Blob(blob);
          else if (speakingStep === 2) setPart2Blob(blob);
          else if (speakingStep === 3) setPart3Blob(blob);
          setAudioBlob(blob);
        }
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
        setIsRecording(false);
        setIsSaving(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPrepPhase(false);
      setRecordingTime(0);
      toast.success("Recording Started! Speak clearly.");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Microphone access denied. Please enable it to record.");
    }
  }, [speakingStep]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      setIsSaving(true);
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      if (recordingTimeRef.current > 0) {
        toast.info(
          "Recording captured. Ready for submission. Please submit your response.",
        );
      } else {
        toast.warn("Recording was too short to be saved.");
      }
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

  // Auto-Stop for Speaking Part 2
  useEffect(() => {
    if (isRecording && speakingStep === 2 && recordingTime >= 120) {
      stopRecording();
      toast.info("Maximum speaking time (2 minutes) reached. Recording stopped.");
    } else if (isRecording && speakingStep === 3 || speakingStep === 1 && recordingTime >= 300) {
      stopRecording();
      toast.info("Maximum speaking time (5 minutes) reached. Recording stopped.");
    }
  }, [recordingTime, isRecording, speakingStep, stopRecording ]);

  // 10s Warning Modal for Preparation countdown (Part 2)
  useEffect(() => {
    if (isPrepPhase && prepTime === 10) {
      Swal.fire({
        title: "10 Seconds of Prep Remaining!",
        text: "Get ready! Recording will begin automatically in 10 seconds.",
        icon: "warning",
        timer: 3500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        timerProgressBar: true,
        background: "#FDFDFB",
        color: "#1e293b",
        customClass: {
          popup: "rounded-[2rem] shadow-2xl border border-amber-300"
        }
      });
    }
  }, [prepTime, isPrepPhase]);

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

  const handleSubmitSpeaking = async () => {
    const hasRecording = part1Blob || part2Blob || part3Blob || audioBlob;
    if (!hasRecording) {
      toast.info("No audio recording captured. Please Submit your response.");
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Auto-submitting your 3-part speaking responses...");

      const urls = [];
      if (part1Blob) {
        toast.info("Uploading Part 1 response...");
        const url1 = await uploadToCloudinary(part1Blob);
        urls.push(`Part 1 Interview: ${url1}`);
      }
      if (part2Blob) {
        toast.info("Uploading Part 2 response...");
        const url2 = await uploadToCloudinary(part2Blob);
        urls.push(`Part 2 Cue Card: ${url2}`);
      } else if (audioBlob && !part2Blob && !part1Blob && !part3Blob) {
        toast.info("Uploading Cue Card response...");
        const url2 = await uploadToCloudinary(audioBlob);
        urls.push(`Part 2 Cue Card: ${url2}`);
      }
      if (part3Blob) {
        toast.info("Uploading Part 3 response...");
        const url3 = await uploadToCloudinary(part3Blob);
        urls.push(`Part 3 Discussion: ${url3}`);
      }

      const combinedContent = urls.join("\n\n");

      if (onSubmitGuest && !user?.email) {
        onSubmitGuest(combinedContent);
        toast.success("Guest test submitted successfully!");
        setSubmitted(true);
        exitFullscreen();
        setIsStarted(false);
        navigate(-1);
        return;
      }

      await axiosSecure.post("/submissions/submit", {
        questionSetId: activeSet._id,
        testType: "speaking",
        title: activeSet.title,
        content: combinedContent,
        userName: user?.displayName || "Student",
        userEmail: user?.email,
      });

      toast.success("Speaking practice test submitted successfully!");
      setSubmitted(true);
      exitFullscreen();
      setIsStarted(false);
      navigate(-1);
    } catch (e) {
      console.error("Submission failed:", e);
      toast.error("Failed to submit speaking response.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExitTest = async () => {
    if (submitted) {
      exitFullscreen();
      setIsStarted(false);
      navigate(-1);
      return;
    }

    const hasRecording = part1Blob || part2Blob || part3Blob || audioBlob || (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive");
    const result = hasRecording
      ? await alerts.confirmExitPractice("Speaking Practice Interview")
      : await alerts.confirmCancelPractice("Speaking Practice Interview");

    if (result.isConfirmed) {
      exitFullscreen();
      setIsStarted(false);

      if (hasRecording) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
          setTimeout(async () => {
            await handleSubmitSpeaking();
          }, 600);
        } else {
          await handleSubmitSpeaking();
        }
      } else {
        toast.info("No recording captured. Exiting practice.");
        navigate(-1);
      }
    } else if (result.isDenied) {
      exitFullscreen();
      setIsStarted(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      setPart1Blob(null);
      setPart2Blob(null);
      setPart3Blob(null);
      setAudioBlob(null);

      Object.keys(localStorage).forEach((key) => {
        if (key.includes("test_cache") || key.includes("test_scratchpad") || key.includes("speaking")) {
          localStorage.removeItem(key);
        }
      });

      toast.info("Practice cancelled. Response discarded.");
      navigate(-1);
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const renderNavigationWizard = () => {
    return (
      <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <button
          type="button"
          disabled={speakingStep === 1}
          onClick={() => {
            if (isRecording) {
              toast.warning("Please stop recording before switching sections");
              return;
            }
            setSpeakingStep((p) => Math.max(1, p - 1));
          }}
          className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl px-6 h-12 font-black text-xs uppercase tracking-widest gap-2 flex items-center disabled:opacity-30 w-full md:w-auto"
        >
          <PiArrowLeftBold className="w-4 h-4" /> Previous Part
        </button>

        <div className="flex items-center gap-3">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (isRecording) {
                  toast.warning("Please stop recording before switching sections");
                  return;
                }
                setSpeakingStep(step);
              }}
              className={`w-10 h-10 rounded-full font-black text-sm transition-all flex items-center justify-center ${
                speakingStep === step
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-500"
              }`}
            >
              {step}
            </button>
          ))}
        </div>

        {speakingStep < 3 ? (
          <button
            type="button"
            onClick={() => {
              if (isRecording) {
                toast.warning("Please stop recording before switching sections");
                return;
              }
              setSpeakingStep((p) => Math.min(3, p + 1));
            }}
            className="btn btn-primary rounded-2xl px-6 h-12 font-black text-xs uppercase tracking-widest flex items-center gap-2 w-full md:w-auto"
          >
            Next Part →
          </button>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={handleSubmitSpeaking}
            className="btn btn-success text-white border-none shadow-xl shadow-success/20 rounded-2xl px-6 h-12 font-black text-xs uppercase tracking-widest flex items-center gap-2 w-full md:w-auto"
          >
            {isUploading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Finish & Submit ✔"
            )}
          </button>
        )}
      </div>
    );
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
    <div className="min-h-screen bg-[#FDFDFB] text-slate-800 pb-20 relative select-none" onContextMenu={e => e.preventDefault()}>
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
          {/* Left Side: 3-Part Cue Card & Questions Display */}
          <div className="lg:col-span-7 space-y-8">
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
            <AnimatePresence mode="wait">
              {speakingStep === 1 && (
                <motion.div
                  key="part1-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card bg-white p-12 rounded-[4rem] text-slate-900 shadow-2xl relative overflow-hidden h-fit border border-slate-100"
                >
                  <div className="absolute top-0 right-0 p-12 text-slate-100 text-9xl -mr-10 -mt-10 pointer-events-none">
                    <PiMicrophoneStageFill />
                  </div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-primary px-5 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em]">
                        Part 1: Introduction & Interview
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <PiClockFill />
                        <span className="text-xs font-bold uppercase">
                          4-5 Minutes
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <h2 className="text-4xl font-black tracking-tighter text-slate-800 leading-tight">
                        {activeSet.title}
                      </h2>
                      <p className="text-slate-500 font-semibold text-sm">
                        Answer the following general questions about yourself, your life, and your interests.
                      </p>
                      
                      <div className="mt-8 space-y-4">
                        {(activeSet.speakingPart1Questions && activeSet.speakingPart1Questions.length > 0
                          ? activeSet.speakingPart1Questions
                          : defaultPart1Questions
                        ).map((q, index) => (
                          <div key={index} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-lg font-bold text-slate-700 leading-relaxed pt-0.5">
                              {q}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {renderNavigationWizard()}
                  </div>
                </motion.div>
              )}

              {speakingStep === 2 && (
                <motion.div
                  key="part2-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card bg-white p-12 rounded-[4rem] text-slate-900 shadow-2xl relative overflow-hidden h-fit border border-slate-100"
                >
                  <div className="absolute top-0 right-0 p-12 text-slate-100 text-9xl -mr-10 -mt-10 pointer-events-none">
                    <PiMicrophoneStageFill />
                  </div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-primary px-5 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em]">
                        Part 2: Long Turn (Cue Card)
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
                        {activeSet.speakingPrompt || activeSet.passage || activeSet.content}
                      </div>
                    </div>

                    {activeSet.images?.filter(img => img && img.trim() !== "").length > 0 && (
                      <div className="grid gap-6 pt-6">
                        {activeSet.images.filter(img => img && img.trim() !== "").map((img, i) => (
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

                    

                    {renderNavigationWizard()}
                  </div>
                </motion.div>
              )}

              {speakingStep === 3 && (
                <motion.div
                  key="part3-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card bg-white p-12 rounded-[4rem] text-slate-900 shadow-2xl relative overflow-hidden h-fit border border-slate-100"
                >
                  <div className="absolute top-0 right-0 p-12 text-slate-100 text-9xl -mr-10 -mt-10 pointer-events-none">
                    <PiMicrophoneStageFill />
                  </div>

                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-primary px-5 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em]">
                        Part 3: Two-way Analytical Discussion
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <PiClockFill />
                        <span className="text-xs font-bold uppercase">
                          4-5 Minutes
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <h2 className="text-4xl font-black tracking-tighter text-slate-800 leading-tight">
                        {activeSet.title}
                      </h2>
                      <p className="text-slate-500 font-semibold text-sm">
                        Discuss abstract issues and concepts related to the topic of Part 2.
                      </p>
                      
                      <div className="mt-8 space-y-4">
                        {(activeSet.speakingPart3Questions && activeSet.speakingPart3Questions.length > 0
                          ? activeSet.speakingPart3Questions
                          : defaultPart3Questions
                        ).map((q, index) => (
                          <div key={index} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-lg font-bold text-slate-700 leading-relaxed pt-0.5">
                              {q}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {renderNavigationWizard()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Audio Recording Studio */}
          <div className="lg:col-span-5 space-y-8">
            <div className="card bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-xl h-fit text-slate-800">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-800">
                      Audio Studio
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Part {speakingStep} of 3
                    </p>
                  </div>
                  <PiWaveformFill className={`text-2xl text-primary ${isRecording ? "animate-pulse" : ""}`} />
                </div>

                <AnimatePresence mode="wait">
                  {isPrepPhase ? (
                    <motion.div
                      key="prep"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="flex flex-col items-center text-center space-y-6 py-10"
                    >
                      <div className="w-32 h-32 rounded-full border-4 border-red-500 border-t-transparent animate-spin flex items-center justify-center p-2">
                        <div className="w-full h-full rounded-full bg-red-500/10 flex items-center justify-center animate-none">
                          <span className="text-3xl font-black font-mono text-red-500">
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
                        type="button"
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
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

                      <div className="space-y-4 w-full">
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
                        type="button"
                        onClick={stopRecording}
                        className="btn btn-error btn-outline rounded-2xl px-12 h-16 font-black w-full border-2"
                      >
                        <PiStopCircleFill className="text-2xl" /> Stop Recording
                      </button>
                    </motion.div>
                  ) : isSaving ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex flex-col items-center text-center space-y-6 py-20 w-full"
                    >
                      <div className="w-20 h-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center text-4xl animate-pulse">
                        💾
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-800">
                          Saving Response...
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                          Processing your audio file
                        </p>
                      </div>
                    </motion.div>
                  ) : activeBlob ? (
                    <motion.div
                      key="recorded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center text-center space-y-8 py-10"
                    >
                      <div className="w-32 h-32 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-5xl text-success animate-pulse">
                        <PiCheckCircleFill />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-800">Part {speakingStep} Response Captured</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          Your response has been saved. Review your recording below or re-record to improve.
                        </p>
                      </div>

                      {activeAudioUrl && (
                        <div className="w-full py-2">
                          <audio src={activeAudioUrl} controls className="w-full rounded-2xl border border-slate-200 shadow-sm" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 w-full gap-4">
                        {speakingStep === 2 ? (
                          <>
                            <button
                              type="button"
                              onClick={startPrep}
                              className="btn btn-ghost border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl h-16 font-black text-xs uppercase tracking-widest"
                            >
                              Re-record with Prep Time
                            </button>
                            <button
                              type="button"
                              onClick={startRecording}
                              className="btn btn-primary rounded-2xl h-16 font-black text-sm uppercase tracking-widest"
                            >
                              Re-record Immediately
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="btn btn-primary rounded-2xl h-16 font-black text-sm uppercase tracking-widest"
                          >
                            Re-record Response
                          </button>
                        )}
                      </div>
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
                        <h4 className="text-xl font-black text-slate-800">Ready to Record Part {speakingStep}?</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          {speakingStep === 2
                            ? "Prepare for 60 seconds or start speaking immediately."
                            : "Record your answers to the interview questions."}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 w-full gap-4">
                        {speakingStep === 2 ? (
                          <>
                            <button
                              type="button"
                              onClick={startPrep}
                              className="btn btn-primary rounded-2xl h-16 font-black text-sm uppercase tracking-widest"
                            >
                              Start Prep Time
                            </button>
                            <button
                              type="button"
                              onClick={startRecording}
                              className="btn btn-ghost rounded-2xl h-16 font-black text-xs uppercase tracking-widest border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                              Record Immediately
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="btn btn-primary rounded-2xl h-16 font-black text-sm uppercase tracking-widest"
                          >
                            Start Recording
                          </button>
                        )}
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
                  {speakingStep === 1
                    ? '"Speak naturally and give detailed answers. Do not give simple yes or no responses."'
                    : speakingStep === 2
                    ? '"Try to talk for the full two minutes. Make sure to cover every point on the cue card."'
                    : '"This is your chance to show off advanced vocabulary and explain complex, abstract opinions."'}
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
