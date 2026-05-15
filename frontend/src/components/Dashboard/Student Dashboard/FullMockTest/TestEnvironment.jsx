import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
    PiMonitor, 
    PiWarning,
    PiClock,
    PiCaretRightBold
} from "react-icons/pi";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import useAuth from "../../../../hooks/useAuth";
import ReadingSection from "./ReadingSection";
import ListeningSection from "./ListeningSection";
import WritingSection from "./WritingSection";
import SpeakingSection from "./SpeakingSection";

const TestEnvironment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isStarted, setIsStarted] = useState(() => !!localStorage.getItem(`test_cache_${id}`));
    
    // Lazy initializers for crash recovery
    const [answers, setAnswers] = useState(() => {
        const cached = localStorage.getItem(`test_cache_${id}`);
        return cached ? JSON.parse(cached).answers : {};
    });
    const [currentModuleIdx, setCurrentModuleIdx] = useState(() => {
        const cached = localStorage.getItem(`test_cache_${id}`);
        return cached ? JSON.parse(cached).currentModuleIdx : 0;
    });
    const [timeLeft, setTimeLeft] = useState(() => {
        const cached = localStorage.getItem(`test_cache_${id}`);
        return cached ? JSON.parse(cached).timeLeft : 0;
    });

    const [tabSwitches, setTabSwitches] = useState(() => {
        const cached = localStorage.getItem(`test_cache_${id}`);
        return cached ? JSON.parse(cached).tabSwitches || 0 : 0;
    });
    const [resultId, setResultId] = useState(() => {
        const cached = localStorage.getItem(`test_cache_${id}`);
        return cached ? JSON.parse(cached).resultId : null;
    });
    const [showWarning, setShowWarning] = useState(false);
    const [warningType, setWarningType] = useState(""); // "fullscreen" or "tab"

    // --- Helper Functions (Defined before Effects to avoid TDZ errors) ---

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => toast.error("Could not enter fullscreen"));
        }
    };

    const handleSaveProgress = async () => {
        if (!test || !resultId) return;
        try {
            await axiosSecure.post("/mock-tests/submit-section", {
                resultId,
                sectionType: ['reading', 'listening', 'writing', 'speaking'][currentModuleIdx],
                answers,
                timeTaken: (test.totalDuration * 60) - timeLeft
            });
        } catch (err) {
            console.error("Failed to sync progress:", err);
            toast.warning("Network issue: Progress saved locally but not synced to server.");
        }
    };

    const handleFinalSubmit = async () => {
        try {
            await axiosSecure.post("/mock-tests/finalize", { resultId });
            localStorage.removeItem(`test_cache_${id}`);
            toast.success("Test submitted successfully!");
            if (document.fullscreenElement) document.exitFullscreen();
            navigate("/dashboard/full-mock-test");
        } catch (err) {
            console.error(err);
            toast.error("Submission failed");
        }
    };

    const handleNextModule = async () => {
        await handleSaveProgress();
        if (currentModuleIdx < 3) {
            setCurrentModuleIdx(prev => prev + 1);
            toast.success(`Moving to ${['Listening', 'Writing', 'Speaking'][currentModuleIdx]} section`);
        } else {
            handleFinalSubmit();
        }
    };

    const handleExitTest = async () => {
        const result = await Swal.fire({
            title: "Terminate Test?",
            text: "Are you sure? This will discard your current progress and you cannot resume this attempt.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, Exit Test",
            background: "#ffffff",
            customClass: {
                popup: "rounded-[2rem]",
                confirmButton: "rounded-xl px-8 py-3 font-bold",
                cancelButton: "rounded-xl px-8 py-3 font-bold"
            }
        });

        if (result.isConfirmed) {
            localStorage.removeItem(`test_cache_${id}`);
            if (document.fullscreenElement) document.exitFullscreen();
            navigate("/dashboard/full-mock-test");
        }
    };

    // --- Effects ---

    // 1. Fetch Test Data
    const { data: test, isLoading } = useQuery({
        queryKey: ["test-session", id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/mock-tests/${id}`);
            return res.data.test;
        }
    });

    // 2. Initialize Test Session
    useEffect(() => {
        if (test && !resultId && isStarted) {
            axiosSecure.post("/mock-tests/start", { testId: id })
                .then(res => {
                    setResultId(res.data.resultId);
                    if (timeLeft === 0) {
                        setTimeLeft((test.totalDuration || 165) * 60);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Failed to initialize test session");
                });
        }
    }, [test, id, isStarted, axiosSecure, resultId]);

    // 3. Timer Countdown Logic
    useEffect(() => {
        if (!isFullscreen || timeLeft <= 0 || !isStarted) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, isFullscreen, isStarted]);

    // 4. Cache Logic
    useEffect(() => {
        if (resultId && isStarted) {
            localStorage.setItem(`test_cache_${id}`, JSON.stringify({
                answers,
                currentModuleIdx,
                timeLeft,
                tabSwitches,
                resultId
            }));
        }
    }, [answers, currentModuleIdx, timeLeft, tabSwitches, id, resultId, isStarted]);

    // 5. Restore Session Effect
    useEffect(() => {
        if (localStorage.getItem(`test_cache_${id}`)) {
            toast.info("Your previous progress has been restored.");
            enterFullscreen();
        }
    }, [id]);

    // 6. Fullscreen Change Monitor
    useEffect(() => {
        const handleFSChange = () => {
            const isFS = !!document.fullscreenElement;
            setIsFullscreen(isFS);
            if (!isFS && isStarted) {
                setShowWarning(true);
                setWarningType("fullscreen");
            }
        };
        document.addEventListener("fullscreenchange", handleFSChange);
        return () => document.removeEventListener("fullscreenchange", handleFSChange);
    }, [isStarted]);

    // 7. Tab Switch Monitor (Anti-cheat)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && isFullscreen && isStarted) {
                const newCount = tabSwitches + 1;
                setTabSwitches(newCount);
                setWarningType("tab");
                setShowWarning(true);
                
                // INSTANT LOCAL ENFORCEMENT
                if (newCount >= 3) {
                    toast.error("Test auto-submitted due to excessive tab switching.");
                    await handleSaveProgress();
                    await axiosSecure.post("/mock-tests/finalize", { resultId });
                    localStorage.removeItem(`test_cache_${id}`);
                    if (document.fullscreenElement) document.exitFullscreen();
                    navigate("/dashboard/full-mock-test");
                    return;
                }

                // Sync to backend in the background
                try {
                    await axiosSecure.post("/mock-tests/update-cheat-stats", { 
                        resultId, 
                        tabSwitches: 1 
                    });
                } catch (err) {
                    console.error("Failed to update cheat stats:", err);
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [tabSwitches, isFullscreen, resultId, axiosSecure, navigate, isStarted, id]);

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen"><span className="loading loading-spinner loading-lg" /></div>;

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
                <div className="card bg-white max-w-lg p-10 text-center space-y-8 shadow-2xl rounded-[3rem]">
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-4xl">
                        <PiMonitor />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase">Ready to Start?</h1>
                        <p className="text-base-content/60">This test will open in fullscreen mode. Ensure you are in a quiet environment.</p>
                    </div>
                    <button 
                        onClick={() => { setIsStarted(true); enterFullscreen(); }}
                        className="btn btn-primary btn-lg rounded-2xl h-16 w-full text-lg font-bold"
                    >
                        Enter Test Environment
                    </button>
                    <button onClick={() => navigate(-1)} className="btn btn-ghost">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 flex flex-col relative select-none" onContextMenu={e => e.preventDefault()}>
            {showWarning && (
                <WarningModal 
                    warningType={warningType}
                    tabSwitches={tabSwitches}
                    setShowWarning={setShowWarning}
                    enterFullscreen={enterFullscreen}
                    handleExitTest={handleExitTest}
                />
            )}

            {tabSwitches > 0 && !showWarning && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-bounce pointer-events-none">
                    <div className="alert alert-warning shadow-2xl rounded-2xl border-none py-2 px-6 flex items-center gap-3">
                        <PiWarning className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">
                            Warning: {tabSwitches}/3 Tab Switches. Next violation will auto-submit.
                        </span>
                    </div>
                </div>
            )}

            {/* Test Header */}
            <header className="bg-white border-b border-base-300 h-20 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col -space-y-1">
                        <span className="text-2xl font-black tracking-tighter text-primary">MOCKEA</span>
                        <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest">IELTS Exam Dashboard</span>
                    </div>

                    <div className="flex items-center gap-4 border-l border-base-300 pl-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-base-content/30 tracking-widest leading-none">Test Active</span>
                            <span className="font-bold text-sm truncate max-w-[150px]">{test?.title}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-6">
                    {['Reading', 'Listening', 'Writing', 'Speaking'].map((m, i) => (
                        <div key={m} className={`flex items-center gap-3 transition-all ${i === currentModuleIdx ? "scale-110" : "opacity-40 grayscale"}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                                i === currentModuleIdx ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-base-200"
                            }`}>
                                {i + 1}
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest ${i === currentModuleIdx ? "text-primary" : ""}`}>{m}</span>
                            {i < 3 && <div className="w-8 h-px bg-base-300" />}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-mono text-2xl shadow-xl transition-all border-b-4 ${
                        timeLeft < 300 
                            ? "bg-error text-white border-error-dark animate-pulse" 
                            : "bg-black text-white border-gray-800"
                    }`}>
                        <PiClock className={timeLeft < 300 ? "animate-spin" : ""} />
                        <span className="tracking-tighter font-black">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                {currentModuleIdx === 0 && test?.sections?.reading?.[0] && (
                    <ReadingSection 
                        data={test.sections.reading[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
                {currentModuleIdx === 1 && test?.sections?.listening?.[0] && (
                    <ListeningSection 
                        data={test.sections.listening[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
                {currentModuleIdx === 2 && test?.sections?.writing?.[0] && (
                    <WritingSection 
                        data={test.sections.writing[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
                {currentModuleIdx === 3 && test?.sections?.speaking?.[0] && (
                    <SpeakingSection 
                        data={test.sections.speaking[0]} 
                    />
                )}
            </main>

            <footer className="bg-white border-t border-base-300 h-20 px-8 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-[10px] font-black text-base-content/30 uppercase tracking-widest">Question Palette</span>
                        <div className="flex gap-1 ml-4">
                            {Array.from({length: 13}).map((_, i) => (
                                <button key={i} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border-b-2 ${
                                    i === 0 
                                    ? "bg-primary text-white border-primary-dark shadow-lg shadow-primary/20" 
                                    : "bg-base-200 border-base-300 hover:bg-base-300"
                                }`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-base-content/30 uppercase tracking-widest">Questions Attempted</p>
                        <p className="text-sm font-bold text-primary">0 of 13 Answered</p>
                    </div>

                    <button 
                        onClick={handleNextModule}
                        className="btn btn-primary btn-lg rounded-2xl px-10 h-14 text-sm font-black shadow-xl shadow-primary/30 flex items-center gap-3 group"
                    >
                        {currentModuleIdx === 3 ? "FINISH TEST" : "CONTINUE TO NEXT SECTION"}
                        <PiCaretRightBold className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

const WarningModal = ({ warningType, tabSwitches, setShowWarning, enterFullscreen, handleExitTest }) => (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="card bg-white w-full max-w-md p-10 text-center space-y-6 animate-pulse rounded-[3rem] shadow-2xl">
            <div className="mx-auto w-24 h-24 rounded-full bg-error/10 flex items-center justify-center">
                <PiMonitor className="w-12 h-12 text-error" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                    {warningType === "fullscreen" ? "Security Alert" : "Integrity Check"}
                </h2>
                <p className="text-base-content/60 leading-relaxed">
                    {warningType === "fullscreen" 
                        ? "Fullscreen mode is required to maintain test integrity. Please re-enter to continue." 
                        : `You have switched tabs ${tabSwitches} times. Reaching 3 switches will result in automatic submission.`}
                </p>
            </div>
            <div className="flex flex-col gap-3 pt-6">
                <button 
                    onClick={() => { setShowWarning(false); enterFullscreen(); }}
                    className="btn btn-primary btn-lg rounded-2xl h-16 text-lg font-bold shadow-xl shadow-primary/20"
                >
                    Resume Test
                </button>
                <button 
                    onClick={handleExitTest}
                    className="btn btn-ghost text-error font-bold"
                >
                    Exit and Terminate
                </button>
            </div>
        </div>
    </div>
);

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default TestEnvironment;
