import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  PiPlay,
  PiCalendarBlankFill,
  PiNotebookFill,
  PiLinkBold,
  PiTrashBold,
  PiSpinner,
  PiXBold,
  PiGraduationCapFill,
  PiPlusBold,
} from "react-icons/pi";
import { useNavigate } from "react-router";
import TestShell from "../../../Common/TestShell.jsx";
import PracticeSetSelector from "../../../Common/PracticeSetSelector.jsx";

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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userData } = useUserProfile();
  const targetExam = userData?.targetExam || "IELTS";

  const { data: fetchedSpeakingSets = [], isLoading: queryLoading } = useQuery({
    queryKey: ["speaking-sets"],
    queryFn: async () => {
      const response = await axiosSecure.get("/questions?type=speaking");
      return response?.data?.questions || [];
    },
    enabled: !!user?.email && !preloadedSet,
    staleTime: 5 * 60 * 1000,
  });

  const speakingSets = preloadedSet ? [preloadedSet] : fetchedSpeakingSets;
  const loading = preloadedSet ? false : queryLoading;

  // Booking UI States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Fetch Student's Booked Sessions
  const { data: bookingsData = {}, refetch: refetchBookings } = useQuery({
    queryKey: ["student-bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings/student/bookings");
      return res.data;
    },
    enabled: !!user?.email && userData?.plan !== "free",
  });
  const bookedSessions = (bookingsData.bookings || []).filter(session => session.status === "booked");

  // Fetch Available Slots
  const { data: availableSlotsData = {}, refetch: refetchAvailableSlots } = useQuery({
    queryKey: ["available-slots"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings/slots/available");
      return res.data;
    },
    enabled: !!user?.email && userData?.plan !== "free",
  });
  const availableSlots = availableSlotsData.slots || [];

  // Filter slots for selectedDate
  const filteredSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots.filter((slot) => {
      const dateObj = new Date(slot.startTime);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const slotDateStr = `${year}-${month}-${day}`;
      return slotDateStr === selectedDate;
    });
  }, [availableSlots, selectedDate]);

  // Book Slot Mutation
  const handleConfirmBooking = async () => {
    if (!selectedSlotId) {
      toast.error("Please select a time slot.");
      return;
    }
    setIsSubmittingBooking(true);
    try {
      await axiosSecure.post(`/bookings/slots/${selectedSlotId}/book`, { studentNotes });
      toast.success("Successfully booked session with instructor!");
      setShowBookingModal(false);
      setSelectedSlotId("");
      setStudentNotes("");
      refetchBookings();
      refetchAvailableSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book session.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Cancel Booking Mutation
  const handleCancelBooking = async (bookingId) => {
    Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this mock speaking session booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Booking",
      cancelButtonText: "No, Keep Booked",
      background: "#ffffff",
      customClass: {
        container: "z-[99999]",
        popup: "rounded-[2rem] shadow-2xl border border-slate-100",
        confirmButton: "rounded-xl px-8 py-3 font-bold btn btn-error text-white border-none mx-2",
        cancelButton: "rounded-xl px-8 py-3 font-bold btn btn-ghost text-slate-500 mx-2 hover:bg-slate-50"
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.post(`/bookings/slots/${bookingId}/cancel`);
          toast.success("Booking cancelled successfully.");
          refetchBookings();
          refetchAvailableSlots();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to cancel booking.");
        }
      }
    });
  };

  const [selectedSetId, setSelectedSetId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [prepTime, setPrepTime] = useState(60); // 1 min prep
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPrepPhase, setIsPrepPhase] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // PTE Speaking States
  const [pteQuestionIdx, setPteQuestionIdx] = useState(0);
  const [pteBlobs, setPteBlobs] = useState([]);
  const pteQuestionIdxRef = useRef(0);
  const pteBlobsRef = useRef([]);
  const [isPlayingPteAudio, setIsPlayingPteAudio] = useState(false);

  useEffect(() => {
    part1QuestionIdxRef.current = part1QuestionIdx;
  }, [part1QuestionIdx]);

  useEffect(() => {
    part3QuestionIdxRef.current = part3QuestionIdx;
  }, [part3QuestionIdx]);

  useEffect(() => {
    pteQuestionIdxRef.current = pteQuestionIdx;
  }, [pteQuestionIdx]);

  // Refs to hold the latest values of blobs to avoid stale closures in timeouts/callbacks
  const part1BlobsRef = useRef([]);
  const part2BlobRef = useRef(null);
  const part3BlobsRef = useRef([]);
  const audioBlobRef = useRef(null);

  const playPteAudio = (text) => {
    if (!text) return;
    if (isPlayingPteAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingPteAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsPlayingPteAudio(true);
    utterance.onend = () => setIsPlayingPteAudio(false);
    utterance.onerror = () => setIsPlayingPteAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [pteQuestionIdx]);

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
  const setPteBlobsWithRef = (valOrFn) => {
    if (typeof valOrFn === "function") {
      setPteBlobs((prev) => {
        const next = valOrFn(prev);
        pteBlobsRef.current = next;
        return next;
      });
    } else {
      pteBlobsRef.current = valOrFn;
      setPteBlobs(valOrFn);
    }
  };
  const setAudioBlobWithRef = (blob) => {
    audioBlobRef.current = blob;
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
    if (activeSet?.examType === "PTE") {
      return pteBlobs[pteQuestionIdx] || null;
    }
    if (speakingStep === 1) return part1Blobs[part1QuestionIdx] || null;
    if (speakingStep === 2) return part2Blob;
    if (speakingStep === 3) return part3Blobs[part3QuestionIdx] || null;
    return null;
  }, [speakingStep, part1Blobs, part1QuestionIdx, part2Blob, part3Blobs, part3QuestionIdx, pteBlobs, pteQuestionIdx, activeSet]);

  const activeAudioUrl = useMemo(() => {
    if (!activeBlob) return null;
    return URL.createObjectURL(activeBlob);
  }, [activeBlob]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
      }
    };
  }, [activeAudioUrl]);

  const studioSubtitle = useMemo(() => {
    if (activeSet?.examType === "PTE") {
      const q = activeSet.questions?.[pteQuestionIdx];
      const typeStr = q?.type === "pte-read-aloud" ? "Read Aloud"
                    : q?.type === "pte-repeat-sentence" ? "Repeat Sentence"
                    : q?.type === "pte-describe-image" ? "Describe Image"
                    : q?.type === "pte-retell-lecture" ? "Retell Lecture"
                    : q?.type === "pte-answer-short-question" ? "Answer Short Question"
                    : "Speaking Task";
      return `${typeStr} • Question ${pteQuestionIdx + 1} of ${activeSet.questions?.length}`;
    }
    if (speakingStep === 1) return `Part 1 of 3 • Question ${part1QuestionIdx + 1} of ${part1Questions.length}`;
    if (speakingStep === 3) return `Part 3 of 3 • Question ${part3QuestionIdx + 1} of ${part3Questions.length}`;
    return "Part 2 of 3 • Cue Card Response";
  }, [speakingStep, part1QuestionIdx, part1Questions, part3QuestionIdx, part3Questions, pteQuestionIdx, activeSet]);

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
  }, [speakingStep, part1QuestionIdx, part3QuestionIdx, pteQuestionIdx]);

  // Speaking data fetched via useQuery above


  useEffect(() => {
    if (activeSet) {
      if (activeSet.examType === "PTE") {
        const len = activeSet.questions?.length || 0;
        setPteBlobs(new Array(len).fill(null));
        pteBlobsRef.current = new Array(len).fill(null);
        setPteQuestionIdx(0);
      } else {
        const p1Len = part1Questions.length;
        /* eslint-disable react-hooks/set-state-in-effect */
        setPart1Blobs(new Array(p1Len).fill(null));
        part1BlobsRef.current = new Array(p1Len).fill(null);

        const p3Len = part3Questions.length;
        setPart3Blobs(new Array(p3Len).fill(null));
        part3BlobsRef.current = new Array(p3Len).fill(null);
        /* eslint-enable react-hooks/set-state-in-effect */

        setPart1QuestionIdx(0);
        setPart3QuestionIdx(0);
      }
    }
  }, [activeSet, part1Questions, part3Questions]);

  const startRecording = useCallback(async () => {
    if (isRecording || isSaving || isPlayingPteAudio) return;

    if (activeSet?.examType === "PTE") {
      if (pteBlobsRef.current[pteQuestionIdxRef.current]) {
        toast.error("You have already recorded a response for this question.");
        return;
      }
    } else {
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
    }

    toast.info("Recording is starting... Please wait.");
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
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (blob.size > 100) {
            if (activeSet?.examType === "PTE") {
              setPteBlobsWithRef((prev) => {
                const updated = prev ? [...prev] : [];
                updated[pteQuestionIdxRef.current] = blob;
                return updated;
              });
            } else if (speakingStep === 1) {
              setPart1BlobsWithRef((prev) => {
                const updated = prev ? [...prev] : [];
                updated[part1QuestionIdxRef.current] = blob;
                return updated;
              });
            } else if (speakingStep === 2) {
              setPart2BlobWithRef(blob);
            } else if (speakingStep === 3) {
              setPart3BlobsWithRef((prev) => {
                const updated = prev ? [...prev] : [];
                updated[part3QuestionIdxRef.current] = blob;
                return updated;
              });
            }
            setAudioBlobWithRef(blob);
          }
        } catch (err) {
          console.error("Recording error:", err);
          toast.error("Failed to capture recording. Please try again.");
        } finally {
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          setMediaStream(null);
          setIsRecording(false);
          setIsSaving(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPrepPhase(false);
      setRecordingTime(0);
      toast.success("Recording Started! Speak clearly.");
    } catch (err) {
      console.error("Microphone access failed:", err);
      toast.error("Microphone access denied. Please enable it to record.");
    }
  }, [speakingStep, isRecording, isSaving, isPlayingPteAudio, activeSet]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== "inactive") {
      try {
        setIsSaving(true);
        setIsRecording(false);
        mediaRecorderRef.current.stop();
        toast.info("Recording captured. Ready for submission. Please submit your response.");
      } catch (err) {
        console.error("Failed to stop recorder:", err);
        setIsSaving(false);
        setIsRecording(false);
      }
    }
  }, [isRecording]);

  const startPrep = () => {
    setIsPrepPhase(true);
    setPrepTime(60);
    toast.info("1-Minute Preparation Time Started");
  };

  // Auto-start prep timer when student goes to cue card (Part 2)
  useEffect(() => {
    if (speakingStep === 2 && activeSet?.examType !== "PTE" && !part2Blob && !isPrepPhase && !isRecording && !isSaving && !isUploading) {
      startPrep();
    }
  }, [speakingStep, activeSet?.examType, part2Blob, isPrepPhase, isRecording, isSaving, isUploading]);


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
    if (activeSet?.examType === "PTE") {
      const q = activeSet.questions?.[pteQuestionIdx];
      if (q?.type === "pte-read-aloud") return 40;
      if (q?.type === "pte-repeat-sentence") return 15;
      if (q?.type === "pte-describe-image") return 40;
      if (q?.type === "pte-retell-lecture") return 40;
      if (q?.type === "pte-answer-short-question") return 10;
      return 40;
    }
    if (speakingStep === 1) return 40;
    if (speakingStep === 3) return 50;
    return 120; // Part 2
  }, [speakingStep, pteQuestionIdx, activeSet]);

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

  const uploadToCloudinary = async (blob, filename, _retryCount = 0) => {
    const MAX_RETRIES = 3;
    try {
      // 1. Fetch secure upload signature from backend
      const signatureRes = await axiosSecure.get('/submissions/upload-signature');
      const { signature, timestamp, folder, apiKey, cloudName } = signatureRes.data;

      // 2. Perform direct-to-cloud signed upload
      const formData = new FormData();
      formData.append("file", blob, filename);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
      );

      return response.data.secure_url;
    } catch (err) {
      if (_retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, _retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return uploadToCloudinary(blob, filename, _retryCount + 1);
      }
      throw err;
    }
  };

  const handleSubmitSpeaking = async () => {
    const p1s = part1BlobsRef.current;
    const p2 = part2BlobRef.current;
    const p3s = part3BlobsRef.current;
    const pteBlobsVal = pteBlobsRef.current;
    const ab = audioBlobRef.current;

    const hasPart1Recording = p1s.some(blob => blob !== null && blob !== undefined);
    const hasPart3Recording = p3s.some(blob => blob !== null && blob !== undefined);
    const hasPteRecording = pteBlobsVal.some(blob => blob !== null && blob !== undefined);
    const hasRecording = hasPart1Recording || p2 || hasPart3Recording || hasPteRecording || ab;

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

      if (activeSet?.examType === "PTE") {
        toast.info("Uploading PTE Speaking responses...");
        urls.push("--- PTE Speaking ---");
        for (let i = 0; i < activeSet.questions.length; i++) {
          const blob = pteBlobsVal[i];
          if (blob) {
            toast.info(`Uploading PTE Q${i + 1} response...`);
            const filename = `${sanitizedUser}_${dateStr}_${testId}_pte_q${i + 1}.webm`;
            const url = await uploadToCloudinary(blob, filename);
            urls.push(`Q${i + 1} [Type: ${activeSet.questions[i].type}]: ${activeSet.questions[i].question}\nAnswer: ${url}`);
          }
        }
      } else {
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

      const MAX_SUBMIT_RETRIES = 3;
      let lastErr;
      for (let attempt = 0; attempt <= MAX_SUBMIT_RETRIES; attempt++) {
        try {
          await axiosSecure.post("/submissions/submit", {
            questionSetId: activeSet._id,
            testType: "speaking",
            title: activeSet.title,
            content: combinedContent,
            userName: userData?.name || user?.displayName || user?.email?.split('@')[0] || "Student",
            userEmail: user?.email,
          });
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          if (err?.response?.status === 429 && attempt < MAX_SUBMIT_RETRIES) {
            await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
          } else {
            throw err;
          }
        }
      }
      if (lastErr) throw lastErr;

      toast.success("Speaking practice test submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-lab-results"] });
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
    const hasPteRecording = pteBlobsRef.current.some(blob => blob !== null && blob !== undefined);
    const hasRecording = hasPart1Recording || part2BlobRef.current || hasPart3Recording || hasPteRecording || audioBlobRef.current || (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive");
    
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
      setPteBlobsWithRef([]);
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

  const handleReturnToDashboard = () => {
    exitFullscreen();
    setIsStarted(false);
    navigate("/dashboard");
  };

  const handleRetake = () => {
    setSubmitted(false);
    setIsSaving(false);
    setIsUploading(false);
    setIsRecording(false);
    setIsPrepPhase(false);
    setPrepTime(60);
    setRecordingTime(0);

    setSpeakingStep(1);
    setPart1Blobs([]);
    setPart2Blob(null);
    setPart3Blobs([]);
    setPart1QuestionIdx(0);
    setPart3QuestionIdx(0);
    
    setPteQuestionIdx(0);
    setPteBlobs([]);
    setIsPlayingPteAudio(false);

    part1QuestionIdxRef.current = 0;
    part3QuestionIdxRef.current = 0;
    pteQuestionIdxRef.current = 0;
    pteBlobsRef.current = [];
    part1BlobsRef.current = [];
    part2BlobRef.current = null;
    part3BlobsRef.current = [];
    audioBlobRef.current = null;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsStarted(true);
    enterFullscreen();
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

  const userPlan = userData?.plan || "free";
  const userRole = userData?.role || "student";

  if (userRole !== "admin" && userRole !== "instructor" && userPlan === "free") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-base-300 rounded-[2.5rem] p-8 md:p-12 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto text-rose-500 text-4xl font-bold">
            🚫
          </div>
          <h1 className="text-3xl font-bold text-slate-800 leading-tight">403 - Access Denied</h1>
          <p className="text-sm text-base-content/60 leading-relaxed">
            The Speaking practice section is exclusive to Standard and Premium plans. Please upgrade your plan to access this lab.
          </p>
          <button 
            onClick={() => navigate("/pricing")}
            className="btn btn-primary w-full rounded-2xl font-black text-sm uppercase tracking-wider animate-bounce"
          >
            Upgrade Plan
          </button>
          <button 
            onClick={() => navigate("/dashboard")}
            className="btn btn-ghost w-full rounded-2xl font-black text-sm uppercase tracking-wider"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!activeSet || (!preloadedSet && !selectedSetId)) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-20 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${
            speakingSets.length > 0
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-amber-50 text-amber-600 border-amber-200"
          }`}>
            <PiMicrophoneStageFill /> {speakingSets.length} Automated Practice Sets Available
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-800">
            IELTS <span className="text-primary italic">Speaking Practice</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            Choose an automated practice set or schedule a live 1-on-1 mock interview with an expert.
          </p>
        </div>

        {/* Live Instructor Booking & Schedule Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Booking Banner & Trigger */}
          <div className="lg:col-span-6 bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between min-h-[250px]">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-primary/20 blur-[80px] rounded-full" />
            <div className="relative z-10 space-y-4">
              <span className="badge badge-primary px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest">
                Premium Feature
              </span>
              <h3 className="text-2xl font-black tracking-tight leading-tight">
                Live 1-on-1 Interview with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0028a2] to-[#E30613]">
                  Certified IELTS Examiners
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium max-w-md">
                Get high-quality academic feedback, slot availability reminders, and full mock test simulations.
              </p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="btn btn-primary rounded-2xl h-14 font-black uppercase tracking-wider relative z-10 w-fit px-8 mt-6"
            >
              <PiCalendarBlankFill className="text-lg" /> Book Live Mock Session
            </button>
          </div>

          {/* Student's Scheduled Live Sessions */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between min-h-[250px]">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                <PiCalendarBlankFill className="text-primary" /> My Scheduled Live Sessions
              </h3>
              {bookedSessions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-semibold text-sm">
                  No upcoming scheduled live interviews.
                </div>
              ) : (
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {bookedSessions.map((session) => {
                    const now = new Date();
                    const start = new Date(session.startTime);
                    const end = new Date(session.endTime);
                    const isOngoing = now >= start && now <= end;

                    return (
                      <div key={session._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                              Instructor: {session.instructor?.name || "Expert Trainer"}
                            </div>
                            {isOngoing && (
                              <span className="badge badge-primary animate-pulse text-[8px] py-1 px-1.5 rounded font-black uppercase tracking-wider text-white">
                                Ongoing
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                            {new Date(session.startTime).toLocaleDateString()} &bull;{" "}
                            {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-primary rounded-lg text-[10px] font-black uppercase"
                            >
                              <PiLinkBold /> Start Room
                            </a>
                          )}
                          {!isOngoing && (
                            <button
                              onClick={() => handleCancelBooking(session._id)}
                              className="btn btn-xs btn-outline btn-error rounded-lg text-[10px] font-black uppercase"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Practice Sets List */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <PiMicrophoneStageFill className="text-primary" /> Automated Practice Sets
          </h3>
          <PracticeSetSelector
            sets={speakingSets}
            onSelect={setSelectedSetId}
            emptyTitle="No Speaking Sessions Yet"
            emptySuggestions={[
              `The admin hasn't uploaded any speaking prompts for ${targetExam} yet.`,
              `Your exam preference might not match the available content — try switching to IELTS or BOTH.`
            ]}
            actionText="Change Exam Preference →"
            actionLink="/dashboard/profile"
            trackExam={targetExam}
            icon={<PiMicrophoneStageFill />}
            timeLabel="15m"
            actionLabel="Open Test"
          />
        </div>

        {/* Live Booking Modal */}
        {showBookingModal && (
          <div className="modal modal-open">
            <div className="modal-box rounded-[2.5rem] max-w-xl p-8 bg-white text-slate-800 border border-slate-100 shadow-2xl relative">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedDate("");
                  setSelectedSlotId("");
                  setStudentNotes("");
                }}
                className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6 text-slate-400 hover:text-slate-700"
              >
                <PiXBold className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-2">
                <PiCalendarBlankFill className="text-primary" /> Book Live Mock Interview
              </h3>

              <div className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">1. Select Date</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlotId("");
                    }}
                    className="input input-bordered w-full rounded-2xl bg-slate-50 font-bold"
                  />
                </div>

                {selectedDate && (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">2. Select Time Slot</span>
                    </label>
                    {filteredSlotsForDate.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 p-2">
                        No available slots on this date. Please try another date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto p-1">
                        {filteredSlotsForDate.map((slot) => (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot._id)}
                            className={`p-3 text-xs font-extrabold rounded-xl border text-center transition-all ${
                              selectedSlotId === slot._id
                              ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div>{slot.instructor?.name || "Expert Trainer"}</div>
                            <div className="mt-1 text-[10px] opacity-80">
                              {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">3. Notes for Instructor</span>
                  </label>
                  <textarea
                    placeholder="Focus areas, weaknesses, or specific topics you'd like to work on..."
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    className="textarea textarea-bordered w-full rounded-2xl bg-slate-50 font-bold h-20 placeholder:text-slate-400"
                  />
                </div>

                <div className="modal-action mt-6">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmittingBooking || !selectedSlotId}
                    className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase tracking-wider"
                  >
                    {isSubmittingBooking ? (
                      <PiSpinner className="animate-spin text-lg" />
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <TestShell
      isStarted={isStarted}
      onStart={() => { setIsStarted(true); enterFullscreen(); }}
      onCancel={() => navigate(-1)}
      title="Ready to Start?"
      description="This practice test will open in fullscreen mode. Ensure you are in a quiet environment and your microphone is working."
      icon={PiMicrophoneStageFill}
      showWarning={showWarning}
      onWarningResume={() => { setShowWarning(false); enterFullscreen(); }}
      onWarningExit={handleExitTest}
    >

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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                  <PiCheckCircleFill className="text-xl" /> Session Finalized
                </div>
                <button
                  onClick={!preloadedSet ? handleRetake : handleReturnToDashboard}
                  className="btn btn-primary btn-sm rounded-2xl px-4 h-10 font-black text-[10px] uppercase tracking-widest"
                >
                  {!preloadedSet ? "Retake Test" : "Return to Dashboard"}
                </button>
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
            {activeSet?.examType !== "PTE" && (
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
            )}
            <AnimatePresence mode="wait">
              {activeSet?.examType === "PTE" ? (
                <motion.div
                  key="pte-card"
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
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-read-aloud" && "Read Aloud"}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-repeat-sentence" && "Repeat Sentence"}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-describe-image" && "Describe Image"}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-retell-lecture" && "Retell Lecture"}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-answer-short-question" && "Answer Short Question"}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <PiClockFill />
                        <span className="text-xs font-bold uppercase">
                          {maxRecordingTime}s Max
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-800 leading-tight">
                          {activeSet.title}
                        </h2>
                        <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest shrink-0">
                          Q {pteQuestionIdx + 1} of {activeSet.questions?.length}
                        </span>
                      </div>
                      
                      <p className="text-slate-500 font-semibold text-sm mt-3">
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-read-aloud" && "Read the text below aloud. Speak clearly and naturally into the microphone."}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-repeat-sentence" && "Listen to the audio sentence, then repeat it exactly as you heard it."}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-describe-image" && "Look at the image below and describe it in your own words."}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-retell-lecture" && "Listen to the lecture recording, then retell what you heard in your own words."}
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-answer-short-question" && "Listen to the short question, then give a brief and concise answer."}
                      </p>
                      
                      <div className="mt-8">
                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-read-aloud" && (
                          <div className="p-8 bg-slate-50 border-2 border-primary/20 rounded-[2rem] shadow-md">
                            <p className="text-2xl font-bold text-slate-800 leading-relaxed">
                              {activeSet.questions?.[pteQuestionIdx]?.question}
                            </p>
                          </div>
                        )}

                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-repeat-sentence" && (
                          <div className="p-8 bg-slate-50 border-2 border-primary/20 rounded-[2rem] shadow-md flex flex-col items-center gap-6">
                            <button
                              type="button"
                              onClick={() => playPteAudio(activeSet.questions?.[pteQuestionIdx]?.pteAudioTranscript)}
                              className={`btn btn-circle btn-lg ${isPlayingPteAudio ? "btn-error animate-pulse" : "btn-primary"} text-white`}
                            >
                              {isPlayingPteAudio ? <PiStopCircleFill className="w-8 h-8" /> : <PiPlay className="w-8 h-8" />}
                            </button>
                            <span className="text-sm font-bold text-slate-600">
                              {isPlayingPteAudio ? "Playing Sentence..." : "Click to Play Sentence"}
                            </span>
                          </div>
                        )}

                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-describe-image" && (
                          <div className="space-y-6">
                            {activeSet.questions?.[pteQuestionIdx]?.question && (
                              <p className="text-lg font-bold text-slate-800 italic">
                                "{activeSet.questions?.[pteQuestionIdx]?.question}"
                              </p>
                            )}
                            {activeSet.questions?.[pteQuestionIdx]?.imageUrl && (
                              <div className="rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner max-h-[350px] flex items-center justify-center bg-slate-100">
                                <img
                                  src={activeSet.questions?.[pteQuestionIdx]?.imageUrl}
                                  alt="Describe Image Prompt"
                                  className="max-h-[350px] object-contain w-auto"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-retell-lecture" && (
                          <div className="p-8 bg-slate-50 border-2 border-primary/20 rounded-[2rem] shadow-md flex flex-col items-center gap-6">
                            <button
                              type="button"
                              onClick={() => playPteAudio(activeSet.questions?.[pteQuestionIdx]?.pteAudioTranscript)}
                              className={`btn btn-circle btn-lg ${isPlayingPteAudio ? "btn-error animate-pulse" : "btn-primary"} text-white`}
                            >
                              {isPlayingPteAudio ? <PiStopCircleFill className="w-8 h-8" /> : <PiPlay className="w-8 h-8" />}
                            </button>
                            <span className="text-sm font-bold text-slate-600">
                              {isPlayingPteAudio ? "Playing Lecture..." : "Click to Play Lecture"}
                            </span>
                          </div>
                        )}

                        {activeSet.questions?.[pteQuestionIdx]?.type === "pte-answer-short-question" && (
                          <div className="p-8 bg-slate-50 border-2 border-primary/20 rounded-[2rem] shadow-md flex flex-col items-center gap-6">
                            <button
                              type="button"
                              onClick={() => playPteAudio(activeSet.questions?.[pteQuestionIdx]?.question)}
                              className={`btn btn-circle btn-lg ${isPlayingPteAudio ? "btn-error animate-pulse" : "btn-primary"} text-white`}
                            >
                              {isPlayingPteAudio ? <PiStopCircleFill className="w-8 h-8" /> : <PiPlay className="w-8 h-8" />}
                            </button>
                            <span className="text-sm font-bold text-slate-600">
                              {isPlayingPteAudio ? "Playing Question..." : "Click to Play Question"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* PTE Navigation dots and arrows */}
                      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={pteQuestionIdx === 0 || isRecording || isSaving}
                          onClick={() => setPteQuestionIdx((prev) => prev - 1)}
                          className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-xs uppercase"
                        >
                          ← Back
                        </button>
                        <div className="flex items-center gap-2">
                          {activeSet.questions?.map((_, index) => {
                            const isRecorded = !!pteBlobs[index];
                            const isActive = index === pteQuestionIdx;
                            return (
                              <button
                                key={index}
                                type="button"
                                disabled={isRecording || isSaving}
                                onClick={() => setPteQuestionIdx(index)}
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
                        {pteQuestionIdx < activeSet.questions?.length - 1 ? (
                          <button
                            type="button"
                            disabled={isRecording || isSaving}
                            onClick={() => setPteQuestionIdx((prev) => prev + 1)}
                            className="btn btn-ghost border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-xs uppercase"
                          >
                            Next →
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => {
                              const allRecorded = activeSet.questions.every((_, idx) => pteBlobs[idx]);
                              if (!allRecorded) {
                                toast.warning("Please record responses for all questions before submitting.");
                                return;
                              }
                              handleSubmitSpeaking();
                            }}
                            className="btn btn-success text-white border-none shadow-xl shadow-success/20 rounded-xl px-6 h-10 font-black text-xs uppercase tracking-widest flex items-center gap-2"
                          >
                            {isUploading ? (
                              <span className="loading loading-spinner" />
                            ) : (
                              "Finish & Submit ✔"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
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
                                    key={index}
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
                                    key={index}
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
                </>
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
                          {activeSet?.examType === "PTE" ? `Question ${pteQuestionIdx + 1} Response Captured` : (speakingStep === 2 ? "Cue Card Response Captured" : `Question ${speakingStep === 1 ? part1QuestionIdx + 1 : part3QuestionIdx + 1} Response Captured`)}
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
                          {activeSet?.examType === "PTE" ? (
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-read-aloud" ? "Ready to Read Aloud?" :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-repeat-sentence" ? "Ready to Repeat Sentence?" :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-describe-image" ? "Ready to Describe Image?" :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-retell-lecture" ? "Ready to Retell Lecture?" :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-answer-short-question" ? "Ready to Answer Question?" :
                            "Ready to Record?"
                          ) : (speakingStep === 2 ? "Ready to Record Cue Card?" : `Ready to Record Question ${speakingStep === 1 ? part1QuestionIdx + 1 : part3QuestionIdx + 1}?`)}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          {activeSet?.examType === "PTE" ? (
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-read-aloud" ? "Take a moment to prepare, then record yourself reading the text clearly." :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-repeat-sentence" ? "Listen to the sentence audio first, then start recording and repeat it." :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-describe-image" ? "Analyze the image, prepare your description, and record." :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-retell-lecture" ? "Listen to the lecture, then summarize and retell it in your recording." :
                            activeSet.questions?.[pteQuestionIdx]?.type === "pte-answer-short-question" ? "Listen to the question, then record a short, concise answer." :
                            "Click start recording when you are ready."
                          ) : (speakingStep === 2
                            ? "Prepare for 60 seconds or start speaking immediately."
                            : `Speak for up to ${speakingStep === 1 ? 40 : 50} seconds to answer the question.`)}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 w-full gap-4">
                        {activeSet?.examType !== "PTE" && speakingStep === 2 ? (
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
                            disabled={isPlayingPteAudio}
                            className="btn btn-primary rounded-2xl h-16 font-black text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPlayingPteAudio ? "Listening..." : "Start Recording"}
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
    </TestShell>
  );
};

export default Speaking;
