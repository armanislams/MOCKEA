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
  const [part1Blobs, setPart1Blobs] = useState([]);
  const [part2Blob, setPart2Blob] = useState(null);
  const [part3Blobs, setPart3Blobs] = useState([]);

  const [part1QuestionIdx, setPart1QuestionIdx] = useState(0);
  const [part3QuestionIdx, setPart3QuestionIdx] = useState(0);

  const part1QuestionIdxRef = useRef(0);
  const part3QuestionIdxRef = useRef(0);

  useEffect(() => {
    part1QuestionIdxRef.current = part1QuestionIdx;
  }, [part1QuestionIdx]);

  useEffect(() => {
    part3QuestionIdxRef.current = part3QuestionIdx;
  }, [part3QuestionIdx]);

  // Refs to hold the latest values of blobs to avoid stale closures in timeouts/callbacks
  const part1BlobsRef = useRef([]);
  const part2BlobRef = useRef(null);
  const part3BlobsRef = useRef([]);
  const audioBlobRef = useRef(null);

  const setPart1BlobsWithRef = (valOrFn) => {
    if (typeof valOrFn === "function") {
      setPart1Blobs((prev) => {
        const next = valOrFn(prev);
        part1BlobsRef.current = next;
        return next;
      });
    } else {
      part1BlobsRef.current = valOrFn;
      setPart1Blobs(valOrFn);
    }
  };
  const setPart2BlobWithRef = (blob) => {
    part2BlobRef.current = blob;
    setPart2Blob(blob);
  };
  const setPart3BlobsWithRef = (valOrFn) => {
    if (typeof valOrFn === "function") {
      setPart3Blobs((prev) => {
        const next = valOrFn(prev);
        part3BlobsRef.current = next;
        return next;
      });
    } else {
      part3BlobsRef.current = valOrFn;
      setPart3Blobs(valOrFn);
    }
  };
  const setAudioBlobWithRef = (blob) => {
    audioBlobRef.current = blob;
    setAudioBlob(blob);
  };

  // Fullscreen & Gating States
  const [isStarted, setIsStarted] = useState(false);
  const { showWarning, setShowWarning, enterFullscreen, exitFullscreen } = useTestIntegrity(isStarted, submitted);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const visualizerCleanupRef = useRef(null);
  const recordingTimeRef = useRef(0);

  // Sync recordingTime to ref to avoid stale closure in callbacks
  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  const activeSet = useMemo(
    () => preloadedSet || speakingSets.find((set) => set._id === selectedSetId) || null,
    [preloadedSet, speakingSets, selectedSetId],
  );

  const part1Questions = useMemo(() => {
    return activeSet?.speakingPart1Questions && activeSet.speakingPart1Questions.length > 0
      ? activeSet.speakingPart1Questions
      : defaultPart1Questions;
  }, [activeSet]);

  const part3Questions = useMemo(() => {
    return activeSet?.speakingPart3Questions && activeSet.speakingPart3Questions.length > 0
      ? activeSet.speakingPart3Questions
      : defaultPart3Questions;
  }, [activeSet]);

  const activeBlob = useMemo(() => {
    if (speakingStep === 1) return part1Blobs[part1QuestionIdx] || null;
    if (speakingStep === 2) return part2Blob;
    if (speakingStep === 3) return part3Blobs[part3QuestionIdx] || null;
    return null;
  }, [speakingStep, part1Blobs, part1QuestionIdx, part2Blob, part3Blobs, part3QuestionIdx]);

  const activeAudioUrl = useMemo(() => {
    if (!activeBlob) return null;
    return URL.createObjectURL(activeBlob);
  }, [activeBlob]);

  const studioSubtitle = useMemo(() => {
    if (speakingStep === 1) return `Part 1 of 3 • Question ${part1QuestionIdx + 1} of ${part1Questions.length}`;
    if (speakingStep === 3) return `Part 3 of 3 • Question ${part3QuestionIdx + 1} of ${part3Questions.length}`;
    return "Part 2 of 3 • Cue Card Response";
  }, [speakingStep, part1QuestionIdx, part1Questions, part3QuestionIdx, part3Questions]);

  // Real-time Canvas Soundwave Visualizer callback ref
  const canvasCallback = useCallback(
    (canvas) => {
      if (visualizerCleanupRef.current) {
        visualizerCleanupRef.current();
        visualizerCleanupRef.current = null;
      }

      if (!canvas || !mediaStream) return;

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
            const gradient = ctx.createLinearGradient(
              0,
              (canvas.height - barHeight) / 2,
              0,
              (canvas.height + barHeight) / 2,
            );
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

        visualizerCleanupRef.current = () => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          if (audioCtx && audioCtx.state !== "closed") audioCtx.close();
        };
      } catch (e) {
        console.error("Audio visualizer failed:", e);
      }
    },
    [mediaStream],
  );

  useEffect(() => {
    return () => {
      if (visualizerCleanupRef.current) {
        visualizerCleanupRef.current();
      }
    };
  }, []);

  // Reset recording state when switching parts or questions to avoid leakage and auto-stop races
  useEffect(() => {
    const timer = setTimeout(() => {
      setRecordingTime(0);
      setAudioBlobWithRef(null);
      setIsRecording(false);
      setIsSaving(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [speakingStep, part1QuestionIdx, part3QuestionIdx]);

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


  useEffect(() => {
    if (activeSet) {
      const p1Len = part1Questions.length;
      setPart1Blobs(new Array(p1Len).fill(null));
      part1BlobsRef.current = new Array(p1Len).fill(null);

      const p3Len = part3Questions.length;
      setPart3Blobs(new Array(p3Len).fill(null));
      part3BlobsRef.current = new Array(p3Len).fill(null);

      setPart1QuestionIdx(0);
      setPart3QuestionIdx(0);
    }
  }, [activeSet, part1Questions, part3Questions]);

  const startRecording = useCallback(async () => {
    console.log("[SpeakingDebug] startRecording called. isRecording:", isRecording, "isSaving:", isSaving, "speakingStep:", speakingStep, "part1QuestionIdx:", part1QuestionIdxRef.current);
    if (isRecording || isSaving) {
      console.warn("[SpeakingDebug] startRecording early return because isRecording or isSaving is active.");
      return;
    }

    // Strict Check: Prevent recording if a response already exists
    if (speakingStep === 1 && part1BlobsRef.current[part1QuestionIdxRef.current]) {
      toast.error("You have already recorded a response for this question.");
      return;
    }
    if (speakingStep === 2 && part2BlobRef.current) {
      toast.error("You have already recorded a response for this part.");
      return;
    }
    if (speakingStep === 3 && part3BlobsRef.current[part3QuestionIdxRef.current]) {
      toast.error("You have already recorded a response for this question.");
      return;
    }

    toast.info("Recording is starting... Please wait.");
    try {
      console.log("[SpeakingDebug] startRecording - requesting getUserMedia...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[SpeakingDebug] startRecording - mic stream acquired successfully:", stream.id);
      setMediaStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("[SpeakingDebug] ondataavailable fired. chunk size:", event.data?.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("[SpeakingDebug] MediaRecorder onstop callback fired. recordingTimeRef.current:", recordingTimeRef.current, "chunks length:", audioChunksRef.current.length);
        try {
          if (recordingTimeRef.current > 0) {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            console.log("[SpeakingDebug] MediaRecorder onstop - created blob of size:", blob.size);
            if (speakingStep === 1) {
              console.log("[SpeakingDebug] MediaRecorder onstop - setting Part 1 blob at index:", part1QuestionIdxRef.current);
              setPart1BlobsWithRef((prev) => {
                const updated = prev ? [...prev] : [];
                updated[part1QuestionIdxRef.current] = blob;
                return updated;
              });
            } else if (speakingStep === 2) {
              console.log("[SpeakingDebug] MediaRecorder onstop - setting Part 2 blob");
              setPart2BlobWithRef(blob);
            } else if (speakingStep === 3) {
              console.log("[SpeakingDebug] MediaRecorder onstop - setting Part 3 blob at index:", part3QuestionIdxRef.current);
              setPart3BlobsWithRef((prev) => {
                const updated = prev ? [...prev] : [];
                updated[part3QuestionIdxRef.current] = blob;
                return updated;
              });
            }
            setAudioBlobWithRef(blob);
          } else {
            console.warn("[SpeakingDebug] MediaRecorder onstop - recording duration was 0, not saving blob.");
          }
        } catch (err) {
          console.error("[SpeakingDebug] Error in MediaRecorder.onstop execution:", err);
          toast.error("Failed to capture recording. Please try again.");
        } finally {
          console.log("[SpeakingDebug] MediaRecorder onstop finally block - cleaning up track stream and resetting state.");
          if (stream) {
            stream.getTracks().forEach((track) => {
              console.log("[SpeakingDebug] Stopping stream track:", track.label);
              track.stop();
            });
          }
          setMediaStream(null);
          setIsRecording(false);
          setIsSaving(false);
          console.log("[SpeakingDebug] MediaRecorder onstop finally block - states reset successfully.");
        }
      };

      console.log("[SpeakingDebug] startRecording - calling mediaRecorder.start()");
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPrepPhase(false);
      setRecordingTime(0);
      toast.success("Recording Started! Speak clearly.");
    } catch (err) {
      console.error("[SpeakingDebug] startRecording failed inside try/catch:", err);
      toast.error("Microphone access denied. Please enable it to record.");
    }
  }, [speakingStep, isRecording, isSaving]);

  const stopRecording = useCallback(() => {
    console.log("[SpeakingDebug] stopRecording called. mediaRecorder status:", mediaRecorderRef.current ? mediaRecorderRef.current.state : "null", "isRecording:", isRecording);
    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== "inactive") {
      try {
        console.log("[SpeakingDebug] stopRecording - Setting isSaving to true and isRecording to false, triggering mediaRecorder.stop()");
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
      } catch (err) {
        console.error("[SpeakingDebug] Failed to stop media recorder in stopRecording catch block:", err);
        setIsSaving(false);
        setIsRecording(false);
      }
    } else {
      console.warn("[SpeakingDebug] stopRecording - condition not met. mediaRecorder:", !!mediaRecorderRef.current, "isRecording:", isRecording, "state:", mediaRecorderRef.current?.state);
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [isPrepPhase]);

  // Transition to recording when preparation phase finishes
  useEffect(() => {
    if (isPrepPhase && prepTime === 0) {
      const timer = setTimeout(() => {
        setIsPrepPhase(false);
        startRecording();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isPrepPhase, prepTime, startRecording]);

  // Recording Timer
  useEffect(() => {
    if (!isRecording) return;
    const iv = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    return () => clearInterval(iv);
  }, [isRecording]);

  const maxRecordingTime = useMemo(() => {
    if (speakingStep === 1) return 40;
    if (speakingStep === 3) return 50;
    return 120; // Part 2
  }, [speakingStep]);

  // Auto-Stop for Speaking Parts
  useEffect(() => {
    if (isRecording && recordingTime >= maxRecordingTime) {
      const timer = setTimeout(() => {
        stopRecording();
        toast.info(`Maximum speaking time (${maxRecordingTime} seconds) reached. Recording stopped.`);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [recordingTime, isRecording, maxRecordingTime, stopRecording]);

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

  const uploadToCloudinary = async (blob, filename) => {
    const formData = new FormData();
    formData.append("file", blob, filename);
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
    const p1s = part1BlobsRef.current;
    const p2 = part2BlobRef.current;
    const p3s = part3BlobsRef.current;
    const ab = audioBlobRef.current;

    const hasPart1Recording = p1s.some(blob => blob !== null && blob !== undefined);
    const hasPart3Recording = p3s.some(blob => blob !== null && blob !== undefined);
    const hasRecording = hasPart1Recording || p2 || hasPart3Recording || ab;

    if (!hasRecording) {
      toast.info("No audio recording captured. Please Submit your response.");
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Auto-submitting your speaking responses...");

      const urls = [];
      const username = userData?.name || user?.displayName || user?.email?.split('@')[0] || "guest";
      const sanitizedUser = username.replace(/[^a-zA-Z0-9]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const testId = activeSet._id;

      if (hasPart1Recording) {
        toast.info("Uploading Part 1 responses...");
        urls.push("--- Part 1 Interview ---");
        for (let i = 0; i < part1Questions.length; i++) {
          const blob = p1s[i];
          if (blob) {
            toast.info(`Uploading Part 1 Q${i + 1} response...`);
            const filename = `${sanitizedUser}_${dateStr}_${testId}_part1_q${i + 1}.webm`;
            const url = await uploadToCloudinary(blob, filename);
            urls.push(`Q${i + 1}: ${part1Questions[i]}\nAnswer: ${url}`);
          }
        }
      }

      if (p2) {
        toast.info("Uploading Part 2 response...");
        urls.push("--- Part 2 Cue Card ---");
        const filename = `${sanitizedUser}_${dateStr}_${testId}_part2.webm`;
        const url2 = await uploadToCloudinary(p2, filename);
        urls.push(`Cue Card: ${activeSet.speakingPrompt || activeSet.passage || activeSet.content}\nAnswer: ${url2}`);
      } else if (ab && !p2 && !hasPart1Recording && !hasPart3Recording) {
        toast.info("Uploading Cue Card response...");
        urls.push("--- Part 2 Cue Card ---");
        const filename = `${sanitizedUser}_${dateStr}_${testId}_part2.webm`;
        const url2 = await uploadToCloudinary(ab, filename);
        urls.push(`Answer: ${url2}`);
      }

      if (hasPart3Recording) {
        toast.info("Uploading Part 3 responses...");
        urls.push("--- Part 3 Discussion ---");
        for (let i = 0; i < part3Questions.length; i++) {
          const blob = p3s[i];
          if (blob) {
            toast.info(`Uploading Part 3 Q${i + 1} response...`);
            const filename = `${sanitizedUser}_${dateStr}_${testId}_part3_q${i + 1}.webm`;
            const url = await uploadToCloudinary(blob, filename);
            urls.push(`Q${i + 1}: ${part3Questions[i]}\nAnswer: ${url}`);
          }
        }
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
        userName: userData?.name || user?.displayName || user?.email?.split('@')[0] || "Student",
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

    const hasPart1Recording = part1BlobsRef.current.some(blob => blob !== null && blob !== undefined);
    const hasPart3Recording = part3BlobsRef.current.some(blob => blob !== null && blob !== undefined);
    const hasRecording = hasPart1Recording || part2BlobRef.current || hasPart3Recording || audioBlobRef.current || (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive");
    
    const result = hasRecording
      ? await alerts.confirmExitPractice("Speaking Practice Interview")
      : await alerts.confirmCancelPractice("Speaking Practice Interview");

    if (result.isConfirmed) {
      if (hasRecording) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try {
            setIsSaving(true);
            mediaRecorderRef.current.stop();
          } catch (err) {
            console.error("Failed to stop media recorder on exit:", err);
            setIsSaving(false);
          }
          setTimeout(async () => {
            await handleSubmitSpeaking();
          }, 600);
        } else {
          await handleSubmitSpeaking();
        }
      } else {
        exitFullscreen();
        setIsStarted(false);
        toast.info("No recording captured. Exiting practice.");
        navigate(-1);
      }
    } else if (result.isDenied) {
      exitFullscreen();
      setIsStarted(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error("Failed to stop media recorder on cancel:", err);
        }
      }

      setPart1BlobsWithRef([]);
      setPart2BlobWithRef(null);
      setPart3BlobsWithRef([]);
      setAudioBlobWithRef(null);

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
                if (step > speakingStep) {
                  if (speakingStep === 1) {
                    const allRecorded = part1Questions.every((_, idx) => part1Blobs[idx]);
                    if (!allRecorded) {
                      toast.warning("Please record all questions in Part 1 before proceeding.");
                      return;
                    }
                  }
                  if (speakingStep === 2 && step === 3) {
                    if (!part2Blob) {
                      toast.warning("Please record your Part 2 response before proceeding.");
                      return;
                    }
                  }
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
              if (speakingStep === 1) {
                const allRecorded = part1Questions.every((_, idx) => part1Blobs[idx]);
                if (!allRecorded) {
                  toast.warning("Please record all questions in Part 1 before proceeding.");
                  return;
                }
              } else if (speakingStep === 2) {
                if (!part2Blob) {
                  toast.warning("Please record your Part 2 response before proceeding.");
                  return;
                }
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
            onClick={() => {
              const allRecorded = part3Questions.every((_, idx) => part3Blobs[idx]);
              if (!allRecorded) {
                toast.warning("Please record all questions in Part 3 before submitting.");
                return;
              }
              handleSubmitSpeaking();
            }}
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

  console.log("[SpeakingDebug] State check on render:", {
    speakingStep,
    part1QuestionIdx,
    part1BlobsLength: part1Blobs.length,
    part1BlobAtIdx: !!part1Blobs[part1QuestionIdx],
    activeBlob: !!activeBlob,
    isPrepPhase,
    isRecording,
    isSaving
  });

  if (isUploading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center text-4xl animate-bounce">
          📤
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-slate-800">Uploading Responses...</h3>
          <p className="text-slate-500 font-medium max-w-sm px-6">
            Saving your speaking recordings to the server. Please do not close this window.
          </p>
        </div>
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

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
                  {fmt(Math.max(0, maxRecordingTime - recordingTime))}
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
                className="btn btn-error text-white rounded-2xl px-8 h-12 font-black border-none shadow-xl shadow-error/20"
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
                          40s Per Question
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-800 leading-tight">
                          {activeSet.title}
                        </h2>
                        <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest shrink-0">
                          Q {part1QuestionIdx + 1} of {part1Questions.length}
                        </span>
                      </div>
                      <p className="text-slate-500 font-semibold text-sm mt-3">
                        Answer the following question about yourself, your life, and your interests. Speak for up to 40 seconds. Once recorded, you cannot re-record.
                      </p>
                      
                      <div className="mt-8">
                        <div className="p-8 bg-slate-50 border-2 border-primary/20 rounded-[2rem] flex gap-5 items-start shadow-md">
                          <span className="w-10 h-10 rounded-2xl bg-primary text-white font-black flex items-center justify-center shrink-0 text-lg shadow-md shadow-primary/20">
                            {part1QuestionIdx + 1}
                          </span>
                          <p className="text-2xl font-bold text-slate-800 leading-relaxed pt-0.5">
                            {part1Questions[part1QuestionIdx]}
                          </p>
                        </div>
                      </div>

                      {/* Question Navigation Dots & Back/Next */}
                      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={part1QuestionIdx === 0 || isRecording || isSaving}
                          onClick={() => setPart1QuestionIdx((prev) => prev - 1)}
                          className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-xs uppercase"
                        >
                          ← Back
                        </button>
                        <div className="flex items-center gap-2">
                          {part1Questions.map((_, index) => {
                            const isRecorded = !!part1Blobs[index];
                            const isActive = index === part1QuestionIdx;
                            return (
                              <button
                                key={index /* eslint-disable-line react/no-array-index-key */}
                                type="button"
                                disabled={isRecording || isSaving}
                                onClick={() => setPart1QuestionIdx(index)}
                                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                                  isActive
                                    ? "bg-primary scale-125 ring-4 ring-primary/20"
                                    : isRecorded
                                    ? "bg-success"
                                    : "bg-slate-200 hover:bg-slate-300"
                                }`}
                                title={`Question ${index + 1}`}
                              />
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          disabled={part1QuestionIdx === part1Questions.length - 1 || isRecording || isSaving}
                          onClick={() => setPart1QuestionIdx((prev) => prev + 1)}
                          className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-xs uppercase"
                        >
                          Next →
                        </button>
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
                      <p className="text-slate-500 font-semibold text-sm mt-3">
                        Speak for 1 to 2 minutes on the cue card topic. Once recorded, you cannot re-record.
                      </p>
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
                          50s Per Question
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-800 leading-tight">
                          {activeSet.title}
                        </h2>
                        <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest shrink-0">
                          Q {part3QuestionIdx + 1} of {part3Questions.length}
                        </span>
                      </div>
                      <p className="text-slate-500 font-semibold text-sm mt-3">
                        Discuss abstract issues and concepts related to the topic of Part 2. Speak for up to 50 seconds. Once recorded, you cannot re-record.
                      </p>
                      
                      <div className="mt-8">
                        <div className="p-8 bg-slate-50 border-2 border-primary/20 rounded-[2rem] flex gap-5 items-start shadow-md">
                          <span className="w-10 h-10 rounded-2xl bg-primary text-white font-black flex items-center justify-center shrink-0 text-lg shadow-md shadow-primary/20">
                            {part3QuestionIdx + 1}
                          </span>
                          <p className="text-2xl font-bold text-slate-800 leading-relaxed pt-0.5">
                            {part3Questions[part3QuestionIdx]}
                          </p>
                        </div>
                      </div>

                      {/* Question Navigation Dots & Back/Next */}
                      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={part3QuestionIdx === 0 || isRecording || isSaving}
                          onClick={() => setPart3QuestionIdx((prev) => prev - 1)}
                          className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-xs uppercase"
                        >
                          ← Back
                        </button>
                        <div className="flex items-center gap-2">
                          {part3Questions.map((_, index) => {
                            const isRecorded = !!part3Blobs[index];
                            const isActive = index === part3QuestionIdx;
                            return (
                              <button
                                key={index /* eslint-disable-line react/no-array-index-key */}
                                type="button"
                                disabled={isRecording || isSaving}
                                onClick={() => setPart3QuestionIdx(index)}
                                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                                  isActive
                                    ? "bg-primary scale-125 ring-4 ring-primary/20"
                                    : isRecorded
                                    ? "bg-success"
                                    : "bg-slate-200 hover:bg-slate-300"
                                }`}
                                title={`Question ${index + 1}`}
                              />
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          disabled={part3QuestionIdx === part3Questions.length - 1 || isRecording || isSaving}
                          onClick={() => setPart3QuestionIdx((prev) => prev + 1)}
                          className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-xs uppercase"
                        >
                          Next →
                        </button>
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
                      {studioSubtitle}
                    </p>
                  </div>
                  <PiWaveformFill className={`text-2xl text-primary ${isRecording ? "animate-pulse" : ""}`} />
                </div>

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
                            ref={canvasCallback}
                            width={320}
                            height={80}
                            className="bg-slate-50 rounded-3xl border border-slate-200 shadow-inner"
                          />
                        </div>
                        <div className="text-5xl font-mono font-black text-slate-800">
                          {fmt(Math.max(0, maxRecordingTime - recordingTime))}
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
                        <h4 className="text-xl font-black text-slate-800">
                          {speakingStep === 2 ? "Cue Card Response Captured" : `Question ${speakingStep === 1 ? part1QuestionIdx + 1 : part3QuestionIdx + 1} Response Captured`}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          Your response has been saved. Review your recording below.
                        </p>
                      </div>

                      {activeAudioUrl && (
                        <div className="w-full py-2">
                          <audio src={activeAudioUrl} controls className="w-full rounded-2xl border border-slate-200 shadow-sm" key={activeAudioUrl} />
                        </div>
                      )}

                      <div className="grid grid-cols-1 w-full gap-4">
                        <div className="text-center py-2">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                            Recording Finalized
                          </span>
                        </div>
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
                        <h4 className="text-xl font-black text-slate-800">
                          {speakingStep === 2 ? "Ready to Record Cue Card?" : `Ready to Record Question ${speakingStep === 1 ? part1QuestionIdx + 1 : part3QuestionIdx + 1}?`}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          {speakingStep === 2
                            ? "Prepare for 60 seconds or start speaking immediately."
                            : `Speak for up to ${speakingStep === 1 ? 40 : 50} seconds to answer the question.`}
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
