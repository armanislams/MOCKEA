import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import alerts from "../../../../utils/alerts";
import { 
    PiWarning,
    PiClock,
    PiCaretRightBold
} from "react-icons/pi";
import FullscreenGate from "../../../Common/FullscreenGate";
import FullscreenWarningOverlay from "../../../Common/FullscreenWarningOverlay";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import ReadingSection from "./ReadingSection";
import ListeningSection from "./ListeningSection";
import WritingSection from "./WritingSection";
import SpeakingSection from "./SpeakingSection";
import Loader from "../../../Loader/Loader";

const TestEnvironment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isStarted, setIsStarted] = useState(() => !!localStorage.getItem(`test_cache_${id}`));
    const [isTerminating, setIsTerminating] = useState(() => {
        return !!localStorage.getItem(`test_cache_${id}`);
    });
    
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

    // Scratchpad States & Drag-Handlers
    const [showScratchpad, setShowScratchpad] = useState(false);
    const [scratchpadText, setScratchpadText] = useState(() => localStorage.getItem(`test_scratchpad_${id}`) || "");
    const [scratchpadPos, setScratchpadPos] = useState({ x: 100, y: 120 });
    const dragStartRef = useRef(null);
    const terminationFiredRef = useRef(false);

    const handleDragStart = (e) => {
        dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: scratchpadPos.x,
            startPosY: scratchpadPos.y
        };
        document.addEventListener("mousemove", handleDragging);
        document.addEventListener("mouseup", handleDragEnd);
    };

    const handleDragging = (e) => {
        if (!dragStartRef.current) return;
        const dx = e.clientX - dragStartRef.current.startX;
        const dy = e.clientY - dragStartRef.current.startY;
        setScratchpadPos({
            x: dragStartRef.current.startPosX + dx,
            y: dragStartRef.current.startPosY + dy
        });
    };

    const handleDragEnd = () => {
        dragStartRef.current = null;
        document.removeEventListener("mousemove", handleDragging);
        document.removeEventListener("mouseup", handleDragEnd);
    };

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
                sectionType: ['listening', 'reading', 'writing', 'speaking'][currentModuleIdx],
                answers,
                timeTaken: (test.totalDuration * 60) - timeLeft
            });
        } catch (err) {
            console.error("Failed to sync progress:", err);
            toast.warning("Network issue: Progress saved locally but not synced to server.");
        }
    };

    const handleFinalSubmit = async (isTerminated = false) => {
        try {
            await axiosSecure.post("/mock-tests/finalize", { resultId, isTerminated });
            localStorage.removeItem(`test_cache_${id}`);
            if (isTerminated) {
                toast.error("Test session terminated.");
            } else {
                toast.success("Test submitted successfully!");
            }
            if (document.fullscreenElement) document.exitFullscreen();
            navigate("/dashboard/full-mock-test");
        } catch (err) {
            console.error(err);
            toast.error("Submission failed");
        }
    };

    const handleNextModule = async () => {
        if (answeredQuestions < totalQuestions) {
            if (currentModuleIdx === 2) {
                toast.error("Please answer both Writing Task 1 and Writing Task 2 before continuing.");
            } else if (currentModuleIdx === 3) {
                toast.error("Please complete all 3 parts of the Speaking section before finishing the test.");
            } else {
                const remaining = totalQuestions - answeredQuestions;
                toast.error(`Please answer all ${totalQuestions} questions before continuing (${remaining} remaining).`);
            }
            return;
        }
        await handleSaveProgress();
        if (currentModuleIdx < 3) {
            setCurrentModuleIdx(prev => prev + 1);
            toast.success(`Moving to ${['Reading', 'Writing', 'Speaking'][currentModuleIdx]} section`);
        } else {
            handleFinalSubmit();
        }
    };

    const handleExitTest = async () => {
        const hasAnswers = Object.keys(answers).some(key => {
            const val = answers[key];
            if (typeof val === 'string') {
                return val.trim() !== "";
            }
            return val !== undefined && val !== null;
        });

        const result = hasAnswers
            ? await alerts.confirmExitMockTest()
            : await alerts.confirmCancelMockTest();

        if (result.isConfirmed) {
            try {
                await axiosSecure.post("/mock-tests/finalize", { resultId, isTerminated: true });
            } catch (err) {
                console.error("Failed to terminate test session:", err);
            }
            localStorage.removeItem(`test_cache_${id}`);
            if (document.fullscreenElement) document.exitFullscreen();
            navigate("/dashboard/full-mock-test");
        }
    };

    const handleTerminateTestClick = async () => {
        const result = await alerts.confirmTerminateMockTest();
        if (result.isConfirmed) {
            await handleSaveProgress();
            await handleFinalSubmit(true);
        } else if (result.isDenied) {
            try {
                await axiosSecure.post("/mock-tests/finalize", { resultId, isTerminated: true });
            } catch (err) {
                console.error("Failed to terminate test session:", err);
            }
            localStorage.removeItem(`test_cache_${id}`);
            if (document.fullscreenElement) document.exitFullscreen();
            navigate("/dashboard/full-mock-test");
        }
    };

    const handleShowTitleIfClipped = (e, title) => {
        const el = e.currentTarget;
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
            el.setAttribute("title", title);
        } else {
            el.removeAttribute("title");
        }
    };

    // --- Effects ---

    // 0. Clear previous test caches on fresh test session startup OR terminate reload
    useEffect(() => {
        const cachedData = localStorage.getItem(`test_cache_${id}`);
        if (cachedData) {
            if (isTerminating) {
                if (terminationFiredRef.current) return;
                terminationFiredRef.current = true;
                try {
                    const parsed = JSON.parse(cachedData);
                    const resId = parsed.resultId;
                    
                    toast.error("Test terminated: Page reload is not allowed during the exam.");
                    
                    const performTermination = async () => {
                        if (resId) {
                            try {
                                await axiosSecure.post("/mock-tests/finalize", { resultId: resId, isTerminated: true });
                            } catch (err) {
                                console.error("Failed to finalize test on reload:", err);
                            }
                        }
                        
                        // Clear all caches
                        localStorage.removeItem(`test_cache_${id}`);
                        localStorage.removeItem(`test_scratchpad_${id}`);
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('speaking_cache_')) {
                                localStorage.removeItem(key);
                            }
                        });
                        
                        navigate("/dashboard/full-mock-test");
                    };
                    
                    performTermination();
                } catch (e) {
                    console.error("Error handling reload termination:", e);
                    localStorage.removeItem(`test_cache_${id}`);
                    navigate("/dashboard/full-mock-test");
                }
            }
        } else {
            // New test session startup
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('speaking_cache_') || key.startsWith('test_scratchpad_')) {
                    localStorage.removeItem(key);
                }
            });
        }
    }, [id, isTerminating, axiosSecure, navigate]);

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
        if (isTerminating) return;
        if (test && !resultId && isStarted) {
            axiosSecure.post("/mock-tests/start", { testId: id })
                .then(res => {
                    setResultId(res.data.resultId);
                    setTimeLeft(prev => prev === 0 ? (test.totalDuration || 165) * 60 : prev);
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Failed to initialize test session");
                });
        }
    }, [test, id, isStarted, axiosSecure, resultId, isTerminating]);

    // 3. Timer Countdown Logic
    useEffect(() => {
        if (isTerminating) return;
        if (!isFullscreen || !isStarted) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isFullscreen, isStarted, isTerminating]);

    // 4. Cache Logic
    useEffect(() => {
        if (isTerminating) return;
        if (resultId && isStarted) {
            localStorage.setItem(`test_cache_${id}`, JSON.stringify({
                answers,
                currentModuleIdx,
                timeLeft,
                tabSwitches,
                resultId,
                timestamp: Date.now()
            }));
        }
    }, [answers, currentModuleIdx, timeLeft, tabSwitches, id, resultId, isStarted, isTerminating]);

    // 4.1 Scratchpad Persistence Logic
    useEffect(() => {
        if (isTerminating) return;
        if (isStarted) {
            localStorage.setItem(`test_scratchpad_${id}`, scratchpadText);
        }
    }, [scratchpadText, id, isStarted, isTerminating]);

    // 4.5 Keyboard Interceptor (Anti-Cheat & DevTools protection)
    useEffect(() => {
        if (isTerminating) return;
        if (!isStarted) return;
        const handleKeyDown = (e) => {
            const isMeta = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();
            
            // Intercept Copy, Paste, Cut, Select All
            if (isMeta && ['c', 'v', 'x', 'a'].includes(key)) {
                e.preventDefault();
                toast.warning("Copy, paste, cut, and select-all actions are disabled to maintain exam integrity.");
                return;
            }
            
            // Intercept DevTools Access
            if (e.key === 'F12' || (isMeta && e.shiftKey && key === 'i')) {
                e.preventDefault();
                toast.warning("Developer Tools access is disabled during the exam.");
                return;
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isStarted, isTerminating]);

    // 5. Restore Session Effect
    useEffect(() => {
        if (isTerminating) return;
        if (localStorage.getItem(`test_cache_${id}`)) {
            toast.info("Your previous progress has been restored.");
            enterFullscreen();
        }
    }, [id, isTerminating]);

    // Scroll to Top on Start
    useEffect(() => {
        if (isStarted) {
            window.scrollTo({ top: 0, behavior: "instant" });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            const scrollContainers = document.querySelectorAll(".overflow-y-auto");
            scrollContainers.forEach(container => {
                container.scrollTop = 0;
            });
        }
    }, [isStarted]);

    // 6. Fullscreen Change Monitor
    useEffect(() => {
        if (isTerminating) return;
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
    }, [isStarted, isTerminating]);

    // 7. Tab Switch Monitor (Anti-cheat)
    useEffect(() => {
        if (isTerminating) return;
        const handleVisibilityChange = async () => {
            if (document.hidden && isFullscreen && isStarted) {
                const newCount = tabSwitches + 1;
                setTabSwitches(newCount);
                setWarningType("tab");
                setShowWarning(true);
                
                // INSTANT LOCAL ENFORCEMENT
                if (newCount >= 3) {
                    toast.error("Test terminated due to excessive tab switching.");
                    await handleSaveProgress();
                    await axiosSecure.post("/mock-tests/finalize", { resultId, isTerminated: true });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabSwitches, isFullscreen, resultId, axiosSecure, navigate, isStarted, id, isTerminating]);

    const handleAnswerChange = useCallback((qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    }, []);

    const { total: totalQuestions, answered: answeredQuestions } = useMemo(() => {
        if (!test) return { total: 0, answered: 0 };
        if (currentModuleIdx === 0) {
            const questions = test.sections?.listening?.[0]?.questions || [];
            return {
                total: questions.length,
                answered: questions.filter(q => !!answers[q.id || q._id]).length
            };
        }
        if (currentModuleIdx === 1) {
            const questions = test.sections?.reading?.[0]?.questions || [];
            return {
                total: questions.length,
                answered: questions.filter(q => !!answers[q.id || q._id]).length
            };
        }
        if (currentModuleIdx === 2) {
            const writingData = test.sections?.writing?.[0];
            if (!writingData) return { total: 0, answered: 0 };
            
            const rawText = answers[writingData._id] || "";
            let hasT1 = false;
            let hasT2 = false;
            
            if (rawText.includes("--- TASK 2")) {
                const match = rawText.match(/--- TASK 1.*---\n([\s\S]*?)\n\n--- TASK 2.*---\n([\s\S]*)/);
                if (match) {
                    hasT1 = match[1]?.trim() !== "";
                    hasT2 = match[2]?.trim() !== "";
                } else {
                    const parts = rawText.split(/--- TASK 2.*---\n?/);
                    const t1 = parts[0].replace(/--- TASK 1.*---\n?/, "").trim();
                    const t2 = parts[1] ? parts[1].trim() : "";
                    hasT1 = t1 !== "";
                    hasT2 = t2 !== "";
                }
            } else {
                hasT1 = rawText.trim() !== "";
                hasT2 = false;
            }
            
            return {
                total: 2,
                answered: (hasT1 ? 1 : 0) + (hasT2 ? 1 : 0)
            };
        }
        if (currentModuleIdx === 3) {
            const speakingData = test.sections?.speaking?.[0];
            if (!speakingData) return { total: 0, answered: 0 };
            const p1 = answers[speakingData._id + '_part1_completed'] === 'completed' ? 1 : 0;
            const p2 = answers[speakingData._id + '_part2_completed'] === 'completed' ? 1 : 0;
            const p3 = answers[speakingData._id + '_part3_completed'] === 'completed' ? 1 : 0;
            return {
                total: 3,
                answered: p1 + p2 + p3
            };
        }
    }, [test, currentModuleIdx, answers]);

    // 8. Exit fullscreen on component unmount
    useEffect(() => {
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, []);

    if (isTerminating) return <Loader />;

    if (isLoading) return <Loader/>

    if (!isStarted) {
        return (
            <FullscreenGate 
                isStarted={isStarted}
                onStart={() => { setIsStarted(true); enterFullscreen(); }}
                onCancel={() => navigate(-1)}
                title="Ready to Start?"
                description="This test will open in fullscreen mode. Ensure you are in a quiet environment."
            />
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-[#FDFDFB] flex flex-col relative select-none" onContextMenu={e => e.preventDefault()}>
            <FullscreenWarningOverlay 
                isOpen={showWarning}
                onResume={() => { setShowWarning(false); enterFullscreen(); }}
                onExit={handleExitTest}
                warningType={warningType}
                tabSwitches={tabSwitches}
            />

            {tabSwitches > 0 && !showWarning && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1040] animate-bounce pointer-events-none">
                    <div className="alert alert-warning shadow-2xl rounded-2xl border-none py-2 px-6 flex items-center gap-3">
                        <PiWarning className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">
                            Warning: {tabSwitches}/3 Tab Switches. On 3rd tab switch, test will terminate.
                        </span>
                    </div>
                </div>
            )}

            {/* Test Header */}
            <header className="bg-white border-b border-base-300 h-20 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col justify-center gap-0.5 cursor-pointer select-none" onClick={handleExitTest}>
                        <img
                            src="/mockea-logo.png"
                            alt="MOCKEA Logo"
                            className="h-9 w-auto object-contain self-start"
                        />
                        <span 
                            className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider truncate max-w-[150px]"
                            onMouseEnter={(e) => handleShowTitleIfClipped(e, test?.title)}
                        >
                            {test?.title}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center font-bold text-sm">
                        {currentModuleIdx + 1}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                        {['Listening', 'Reading', 'Writing', 'Speaking'][currentModuleIdx]} Section
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowScratchpad(prev => !prev)}
                        className={`btn rounded-2xl h-12 font-black text-xs uppercase tracking-widest px-5 ${
                            showScratchpad 
                            ? "btn-primary shadow-xl shadow-primary/20 border-none" 
                            : "btn-ghost border border-base-300 bg-white hover:bg-base-100"
                        }`}
                    >
                        📝 Scratchpad
                    </button>
                    <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-mono text-2xl shadow-md transition-all border ${
                        timeLeft < 300 
                            ? "bg-red-500 text-white border-red-600 animate-pulse" 
                            : "bg-red-50 text-red-500 border-red-500"
                    }`}>
                        <PiClock className={timeLeft < 300 ? "animate-spin" : ""} />
                        <span className="tracking-tighter font-black">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                {currentModuleIdx === 0 && test?.sections?.listening?.[0] && (
                    <ListeningSection 
                        data={test.sections.listening[0]} 
                        answers={answers} 
                        onAnswerChange={handleAnswerChange} 
                    />
                )}
                {currentModuleIdx === 1 && test?.sections?.reading?.[0] && (
                    <ReadingSection 
                        data={test.sections.reading[0]} 
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
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                    />
                )}
            </main>

            <footer className="bg-white border-t border-base-300 h-20 px-8 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                <div className="flex items-center gap-6">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-base-content/30 uppercase tracking-widest leading-none mb-1">Current Section Progress</p>
                        <p className="text-base font-bold text-primary">{answeredQuestions} of {totalQuestions} Answered</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <button 
                        onClick={answeredQuestions < totalQuestions ? handleTerminateTestClick : handleNextModule}
                        className={`btn btn-lg rounded-2xl px-10 h-14 text-sm font-black shadow-xl flex items-center gap-3 group ${
                            answeredQuestions < totalQuestions 
                            ? "btn-error text-white shadow-error/20" 
                            : "btn-primary shadow-primary/30"
                        }`}
                    >
                        {currentModuleIdx === 3 && answeredQuestions === totalQuestions 
                            ? "FINISH TEST" 
                            : (answeredQuestions < totalQuestions ? "TERMINATE TEST" : "CONTINUE TO NEXT SECTION")}
                        <PiCaretRightBold className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </footer>

            {/* Draggable Resizable Scratchpad Panel */}
            {showScratchpad && (
                <div 
                    className="fixed z-[999] bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-white/10 flex flex-col select-text overflow-hidden"
                    style={{ 
                        top: `${scratchpadPos.y}px`, 
                        left: `${scratchpadPos.x}px`,
                        width: "360px",
                        height: "280px",
                        resize: "both",
                        minWidth: "280px",
                        minHeight: "200px"
                    }}
                >
                    {/* Header */}
                    <div 
                        onMouseDown={handleDragStart}
                        className="bg-slate-950/80 px-5 py-3.5 flex items-center justify-between border-b border-white/5 cursor-move select-none"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            📝 Exam Notes Scratchpad
                        </span>
                        <button 
                            onClick={() => setShowScratchpad(false)}
                            className="btn btn-ghost btn-circle btn-xs text-white/40 hover:text-white hover:bg-white/10"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content Textarea */}
                    <div className="flex-1 p-4 flex">
                        <textarea
                            value={scratchpadText}
                            onChange={(e) => setScratchpadText(e.target.value)}
                            placeholder="Write down any notes, exam keywords, or essay outlines here. Notes are saved automatically."
                            className="w-full h-full bg-slate-950/40 text-slate-200 border-none resize-none focus:outline-none text-xs p-4 rounded-2xl placeholder-slate-600 font-medium font-serif leading-relaxed"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default TestEnvironment;
