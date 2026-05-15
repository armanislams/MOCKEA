import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from "../../../../hooks/useAuth";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const Practice = () => {
  const { user } = useAuth();

  const axiosSecure = useAxiosSecure();

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Input State
  const [transcription, setTranscription] = useState("");
  const wordCount =
    transcription.trim() === "" ? 0 : transcription.trim().split(/\s+/).length;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // A placeholder audio file
  const audioUrl =
    "https://uploads.teachablecdn.com/attachments/onaBYdQGS6WkAARio4XR_Catching+Up+With+Friends+Audio+2.mp3";
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Audio Effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e) => {
    const width = progressRef.current.clientWidth;
    const offset = e.nativeEvent.offsetX;
    const divprogress = offset / width;
    audioRef.current.currentTime = divprogress * audioRef.current.duration;
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Stopwatch Effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Text Input Effects
  useEffect(() => {
    if (transcription.trim() !== "") {
      setIsSaving(true);
      const timer = setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transcription]);

  // Submission
  const handleSubmit = async () => {
    if (transcription.trim() === "") return;

    setIsSubmitting(true);

    try {
      await axiosSecure.post("/note/post", {
        email: user?.email,
        notes: transcription,
      });

      toast.success("Practice note saved successfully!");
      setTranscription("");
      // setWordCount(0);
      setLastSaved(null);
      // Optional: stop audio
      audioRef.current.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save practice note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-l-4 border-primary pl-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Interactive Listening Practice
            </h1>
            <p className="text-gray-600 text-lg">
              Listen to the audio and transcribe the conversation. Your progress
              is monitored and will be saved to your profile.
            </p>
          </div>
          <div className="flex flex-col items-end bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 min-w-[140px]">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Time Elapsed
            </span>
            <span className="text-2xl font-mono font-extrabold text-primary tracking-tight">
              {formatTime(timeElapsed)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Audio Player & Rules */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              {/* Custom Audio Player */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Audio Recording
                    </h2>
                    <span className="text-xs font-semibold bg-blue-50 text-primary px-2 py-1 rounded">
                      Part 1
                    </span>
                  </div>

                  <audio ref={audioRef} src={audioUrl} preload="metadata" />

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 shrink-0 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-full transition-transform active:scale-95 shadow-md"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <FaPause size={18} />
                      ) : (
                        <FaPlay size={18} className="ml-1" />
                      )}
                    </button>

                    <div className="grow flex flex-col gap-1.5">
                      <div
                        className="w-full h-2.5 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                        onClick={handleProgressClick}
                        ref={progressRef}
                      >
                        <div
                          className="h-full bg-primary transition-all duration-100 ease-linear"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <FaVolumeMute size={20} />
                      ) : (
                        <FaVolumeUp size={20} />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold">Instructions:</span> You
                      will hear a conversation. While listening, use the text
                      area to type exactly what you hear. You can play and pause
                      as needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hidden lg:block">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-sm">
                    i
                  </span>
                  Test Rules
                </h3>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                    <span>
                      <strong>No repeats:</strong> In the real exam, the audio
                      plays only once. For practice, controls are provided.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                    <span>
                      <strong>Spelling matters:</strong> Incorrect spelling will
                      result in a marked down score.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
                    <span>
                      <strong>Word limits:</strong> Pay attention to
                      instructions like "Write NO MORE THAN TWO WORDS".
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Text Input Area */}
          <div className="lg:col-span-7 flex flex-col min-h-[600px]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                <h2 className="font-bold text-gray-800">Your Response</h2>
                <div className="flex items-center gap-4 text-xs font-medium">
                  {transcription.trim() !== "" && (
                    <span
                      className={`transition-opacity duration-300 ${isSaving ? "text-blue-500" : "text-green-600"}`}
                    >
                      {isSaving
                        ? "Saving..."
                        : lastSaved
                          ? `Auto-saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                    </span>
                  )}
                  <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600 shadow-sm">
                    {wordCount} words
                  </span>
                </div>
              </div>

              <div className="grow p-0 relative group">
                <textarea
                  className="w-full h-full min-h-[350px] p-6 resize-none focus:outline-none focus:ring-0 bg-transparent text-gray-800 leading-relaxed font-medium placeholder:text-gray-300 placeholder:font-normal"
                  placeholder="Type what you hear..."
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  spellCheck="false"
                ></textarea>

                <div className="absolute inset-0 border-2 border-transparent group-focus-within:border-primary/10 rounded-b-xl pointer-events-none transition-colors"></div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end rounded-b-xl bg-gray-50/50">
                <button
                  onClick={handleSubmit}
                  disabled={transcription.trim() === "" || isSubmitting}
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-md font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Submit Answer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
