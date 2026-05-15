import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { 
    PiMonitor, 
    PiWarning, 
    PiSignOut, 
    PiArrowsInLineVertical,
    PiClock,
    PiCheckCircle
} from "react-icons/pi";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import ReadingSection from "./ReadingSection";
import ListeningSection from "./ListeningSection";
import WritingSection from "./WritingSection";

const TestEnvironment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [resultId, setResultId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [showWarning, setShowWarning] = useState(false);
    const [warningType, setWarningType] = useState(""); // "fullscreen" or "tab"

    // 1. Fetch Test Data
    const { data: test, isLoading } = useQuery({
        queryKey: ["test-session", id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/mock-tests/${id}`);
            return res.data.test;
        }
    });

    // 2. Start Test Session and Initialize Timer
    useEffect(() => {
        if (test && !resultId) {
            axiosSecure.post("/mock-tests/start", { testId: id, userId: user._id })
                .then(res => {
                    setResultId(res.data.resultId);
                    setTimeLeft((test.totalDuration || 165) * 60);
                })
                .catch(err => toast.error("Failed to initialize test session"));
        }
    }, [test, id, user._id, axiosSecure, resultId]);

    // 3. Timer Countdown Logic
    useEffect(() => {
        if (!isFullscreen || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, isFullscreen]);

    // 4. Cache & Sync Logic
    // Save to localStorage whenever answers change
    useEffect(() => {
        if (resultId && Object.keys(answers).length > 0) {
            localStorage.setItem(`test_cache_${id}`, JSON.stringify({
                answers,
                currentModuleIdx,
                timeLeft
            }));
        }
    }, [answers, currentModuleIdx, timeLeft, id, resultId]);

    // Load from localStorage on mount (Crash Recovery)
    useEffect(() => {
        const cached = localStorage.getItem(`test_cache_${id}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            setAnswers(parsed.answers || {});
            setCurrentModuleIdx(parsed.currentModuleIdx || 0);
            if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
            toast.info("Your previous progress has been restored.");
        }
    }, [id]);

    const handleSaveProgress = async () => {
        try {
            await axiosSecure.post("/mock-tests/submit-section", {
                resultId,
                sectionType: ['reading', 'listening', 'writing'][currentModuleIdx],
                answers,
                timeTaken: (test.totalDuration * 60) - timeLeft
            });
            console.log("Section synced to backend");
        } catch (err) {
            console.error("Failed to sync progress:", err);
            toast.warning("Network issue: Progress saved locally but not synced to server.");
        }
    };

    // 3. Fullscreen Management
    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => toast.error("Could not enter fullscreen"));
        }
    };

    useEffect(() => {
        const handleFSChange = () => {
            const isFS = !!document.fullscreenElement;
            setIsFullscreen(isFS);
            if (!isFS) {
                setShowWarning(true);
                setWarningType("fullscreen");
            }
        };
        document.addEventListener("fullscreenchange", handleFSChange);
        return () => document.removeEventListener("fullscreenchange", handleFSChange);
    }, []);

    // 4. Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isFullscreen) {
                const newCount = tabSwitches + 1;
                setTabSwitches(newCount);
                setWarningType("tab");
                setShowWarning(true);
                
                // Update backend stats
                axiosSecure.post("/mock-tests/update-cheat-stats", { 
                    resultId, 
                    tabSwitches: 1 
                }).then(res => {
                    if (res.data.status === 'auto-submitted') {
                        toast.error("Test auto-submitted due to excessive tab switching.");
                        navigate("/dashboard/full-mock-test");
                    }
                });
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [tabSwitches, isFullscreen, resultId, axiosSecure, navigate]);

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleNextModule = async () => {
        await handleSaveProgress();
        if (currentModuleIdx < 2) {
            setCurrentModuleIdx(prev => prev + 1);
            toast.success(`Moving to ${['Listening', 'Writing'][currentModuleIdx]} section`);
        } else {
            handleFinalSubmit();
        }
    };

    const handleFinalSubmit = async () => {
        try {
            await axiosSecure.post("/mock-tests/finalize", { resultId });
            localStorage.removeItem(`test_cache_${id}`); // Clear cache on success
            toast.success("Test submitted successfully!");
            document.exitFullscreen();
            navigate("/dashboard/full-mock-test");
        } catch (err) {
            toast.error("Submission failed");
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen"><span className="loading loading-spinner loading-lg" /></div>;

    // Warning Modal
    const WarningModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="card bg-white w-full max-w-md p-8 text-center space-y-6 animate-pulse">
                <div className="mx-auto w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
                    <PiMonitor className="w-12 h-12 text-error" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase">
                        {warningType === "fullscreen" ? "Fullscreen Required" : "Tab Switch Detected"}
                    </h2>
                    <p className="text-base-content/60">
                        {warningType === "fullscreen" 
                            ? "This test must be taken in fullscreen mode to prevent issues." 
                            : `Warning: You exited the test window. (${tabSwitches}/3 switches). After 3 switches, your test will be auto-submitted.`}
                    </p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                    <button 
                        onClick={() => { setShowWarning(false); enterFullscreen(); }}
                        className="btn btn-primary btn-lg rounded-2xl h-16 text-lg font-bold"
                    >
                        {warningType === "fullscreen" ? "Enter Fullscreen" : "Re-enter Fullscreen"}
                    </button>
                    <button 
                        onClick={() => navigate("/dashboard/full-mock-test")}
                        className="btn btn-ghost text-error"
                    >
                        Exit Test
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-base-200 flex flex-col relative select-none" onContextMenu={e => e.preventDefault()}>
            {!isFullscreen && showWarning && <WarningModal />}
            {isFullscreen && showWarning && warningType === "tab" && (
                <div className="fixed top-10 right-10 z-[100] animate-bounce">
                    <div className="alert alert-error shadow-2xl rounded-3xl border-none p-6">
                        <PiWarning className="w-8 h-8" />
                        <div>
                            <h3 className="font-bold">Tab switch detected ({tabSwitches}/3)</h3>
                            <div className="text-xs">Your test will be auto-submitted after 3 switches.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Header */}
            <header className="bg-white border-b border-base-300 h-20 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <div className="text-xl font-black tracking-tighter text-primary">MOCKEA</div>
                    <div className="h-8 w-[1px] bg-base-300" />
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-base-content/40 tracking-widest">Ongoing Test</span>
                        <span className="font-bold text-sm">{test.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Module Progress */}
                    <div className="hidden md:flex items-center gap-4">
                        {['Reading', 'Listening', 'Writing'].map((m, i) => (
                            <div key={m} className={`flex items-center gap-2 text-xs font-bold ${i === currentModuleIdx ? "text-primary" : "text-base-content/30"}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${i === currentModuleIdx ? "border-primary bg-primary/5" : "border-base-200"}`}>
                                    {i + 1}
                                </span>
                                {m}
                                {i < 2 && <div className="w-4 h-[1px] bg-base-200 mx-1" />}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-mono text-xl shadow-lg transition-colors ${
                            timeLeft < 300 ? "bg-error text-white animate-pulse" : "bg-black text-white"
                        }`}>
                            <PiClock className={timeLeft < 300 ? "animate-spin" : "animate-pulse"} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                        <button 
                            onClick={handleNextModule}
                            className="btn btn-error rounded-2xl px-6 h-12 text-sm font-bold shadow-lg shadow-error/20"
                        >
                            {currentModuleIdx === 2 ? "Final Submit" : "Next Section"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Test Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {currentModuleIdx === 0 && (
                    <ReadingSection 
                        data={test.sections.reading[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
                {currentModuleIdx === 1 && (
                    <ListeningSection 
                        data={test.sections.listening[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
                {currentModuleIdx === 2 && (
                    <WritingSection 
                        data={test.sections.writing[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
            </main>

            {/* Test Footer */}
            <footer className="bg-white border-t border-base-300 h-16 px-8 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-base-content/40 uppercase">Navigation</span>
                    <div className="flex gap-1 ml-4">
                        {Array.from({length: 13}).map((_, i) => (
                            <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === 0 ? "bg-primary text-white" : "bg-base-200 hover:bg-base-300"}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-xs font-bold text-base-content/40 uppercase">
                    0 of 13 answered
                </div>
            </footer>
        </div>
    );
};

export default TestEnvironment;
