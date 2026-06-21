import { useState, useEffect, useMemo, useRef } from "react";
import useAnswers from "../../../../hooks/useAnswers";
import useCountdown from "../../../../hooks/useCountdown";
import useAxiosSecure from "../../../../hooks/useAxiosSecure.jsx";
import useAuth from "../../../../hooks/useAuth.jsx";
import useUserProfile from "../../../../hooks/useUserProfile.jsx";
import { toast } from "react-toastify";
import alerts from "../../../../utils/alerts";
import { convertMarkdownContentToHtml } from "../../../../utils/markdownUtils.js";
import Loader from "../../../Loader/Loader.jsx";
import { motion } from "framer-motion";
import { 
    PiBookOpenFill, 
    PiCheckCircleFill, 
    PiXCircleFill, 
    PiArrowRightBold,
    PiClockFill,
    PiChartLineUpFill,
    PiArrowLeftBold
} from "react-icons/pi";
import { useNavigate } from "react-router";
import useTestIntegrity from "../../../../hooks/useTestIntegrity.jsx";
import TestShell from "../../../Common/TestShell.jsx";
import useEvaluate from "../../../../hooks/useEvaluate";

const MatchingGridRenderer = ({ questions, options, answers, onAnswerChange, submitted, result, activeSet }) => {
    return (
        <div className="overflow-x-auto my-6 border border-slate-200 rounded-3xl bg-slate-50/20 p-5 shadow-inner">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200">
                        <th className="p-3 font-black text-xs uppercase tracking-widest text-slate-500">
                            Question
                        </th>
                        {options.map((opt, i) => (
                            <th key={i} className="p-3 text-center font-black text-xs uppercase tracking-widest text-slate-600">
                                {opt}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => {
                        const idx = activeSet.questions.findIndex(item => item.id === q.id);
                        const evaluation = result?.evaluatedAnswers?.find((a) => a.questionId === q.id);
                        const isCorrect = evaluation?.isCorrect;
                        const selectedVal = answers[q.id] || "";
                        
                        return (
                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-semibold text-slate-700 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-[10px] text-slate-500 flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <span>{q.question}</span>
                                </td>
                                {options.map((opt, optIdx) => {
                                    const isSelected = selectedVal === opt;
                                    const isCorrectOption = q.correctAnswer === opt;
                                    
                                    // Styling on submission
                                    let cellContent = null;
                                    if (submitted) {
                                        if (isSelected && isCorrect) {
                                            cellContent = <PiCheckCircleFill className="text-emerald-500 text-lg mx-auto" />;
                                        } else if (isSelected && !isCorrect) {
                                            cellContent = <PiXCircleFill className="text-red-500 text-lg mx-auto" />;
                                        } else if (!isSelected && isCorrectOption) {
                                            cellContent = (
                                                <div className="flex items-center justify-center">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                                                        ✓
                                                    </span>
                                                </div>
                                            );
                                        }
                                    }

                                    return (
                                        <td key={optIdx} className="p-3 text-center align-middle">
                                            {submitted ? (
                                                cellContent || (
                                                    <input
                                                        type="radio"
                                                        disabled
                                                        checked={isSelected}
                                                        className="radio radio-primary radio-xs opacity-20 pointer-events-none mx-auto"
                                                    />
                                                )
                                            ) : (
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={opt}
                                                    checked={isSelected}
                                                    onChange={() => onAnswerChange(q.id, opt)}
                                                    className="radio radio-primary radio-sm cursor-pointer mx-auto transition-transform hover:scale-110"
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const QuestionRenderer = ({ q, idx, submitted, answers, handleAnswerChange, isCorrect, correctAnswer }) => {
    return (
        <div className={`space-y-4 p-6 rounded-3xl transition-all ${
            submitted 
            ? (isCorrect ? "bg-success/5 border border-success/20" : "bg-error/5 border border-error/20")
            : "bg-base-50/50 border border-base-200"
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-white border border-base-300 flex items-center justify-center font-black text-sm shadow-sm">{idx + 1}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Question</span>
                </div>
                {submitted && (
                    isCorrect ? <PiCheckCircleFill className="text-success text-xl" /> : <PiXCircleFill className="text-error text-xl" />
                )}
            </div>

            <p className="font-bold text-slate-700 leading-snug">{q.question}</p>

            {q.options && q.options.filter(opt => opt && opt.trim() !== "").length > 0 ? (
                <div className="grid gap-3">
                    {q.options.filter(opt => opt && opt.trim() !== "").map((opt, oIdx) => (
                        <label 
                            key={oIdx}
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                answers[q.id] === opt 
                                ? "bg-primary/10 border-primary text-primary font-bold shadow-md shadow-primary/10" 
                                : "bg-white border-base-200 hover:border-primary/30"
                            }`}
                        >
                            <input 
                                type="radio" 
                                className="hidden"
                                name={q.id}
                                value={opt}
                                disabled={submitted}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center p-1">
                                {answers[q.id] === opt && <div className="w-full h-full rounded-full bg-current" />}
                            </span>
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    <input 
                        type="text" 
                        disabled={submitted}
                        className="input input-bordered w-full rounded-2xl font-bold bg-white focus:border-primary"
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                    {submitted && !isCorrect && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-success mt-2 flex items-center gap-1">
                            <PiCheckCircleFill /> Correct: {correctAnswer}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const groupQuestions = (questions) => {
    const groups = [];
    let currentGridGroup = null;

    for (const q of questions) {
        if (q.type === 'matching-grid') {
            if (currentGridGroup) {
                currentGridGroup.questions.push(q);
            } else {
                currentGridGroup = {
                    type: 'matching-grid-group',
                    options: (q.options || []).filter(o => o && o.trim() !== ""),
                    questions: [q]
                };
                groups.push(currentGridGroup);
            }
        } else {
            currentGridGroup = null;
            groups.push({
                type: 'single',
                question: q
            });
        }
    }
    return groups;
};

const groupVisualsByQuestionGroups = (visualGroups, questionGroups, offset, questions) => {
    const grouped = [];
    const assignedVisuals = new Set();
    const sortedGroups = [...(questionGroups || [])].sort((a, b) => Number(a.fromQuestion) - Number(b.fromQuestion));

    for (const qg of sortedGroups) {
        const fromQ = Number(qg.fromQuestion);
        const toQ = Number(qg.toQuestion);
        const groupVisuals = [];

        for (let i = 0; i < visualGroups.length; i++) {
            if (assignedVisuals.has(i)) continue;

            const vg = visualGroups[i];
            const firstQ = vg.type === 'matching-grid-group' ? vg.questions[0] : vg.question;
            const firstQIdx = questions.findIndex(item => item.id === firstQ.id);
            const globalQNum = offset + firstQIdx + 1;

            if (globalQNum >= fromQ && globalQNum <= toQ) {
                groupVisuals.push(vg);
                assignedVisuals.add(i);
            }
        }

        if (groupVisuals.length > 0) {
            grouped.push({
                type: 'group',
                header: qg,
                visuals: groupVisuals
            });
        }
    }

    const ungroupedVisuals = [];
    for (let i = 0; i < visualGroups.length; i++) {
        if (!assignedVisuals.has(i)) {
            ungroupedVisuals.push(visualGroups[i]);
        }
    }

    if (ungroupedVisuals.length > 0) {
        grouped.push({
            type: 'ungrouped',
            visuals: ungroupedVisuals
        });
    }

    return grouped;
};

const GroupedContainer = ({ header, children }) => {
    return (
        <div className="card p-8 rounded-[3rem] border border-slate-200 bg-slate-50/20 space-y-6 shadow-xs w-full mb-6">
            {header && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary px-5 py-3 rounded-r-2xl">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-primary">
                                Questions {header.fromQuestion}–{header.toQuestion}
                            </span>
                            {header.title && (
                                <span className="font-bold text-sm text-slate-700">· {header.title}</span>
                            )}
                        </div>
                        {header.linkUrl && (
                            <a 
                                href={header.linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline bg-white border border-primary/20 px-3 py-1.5 rounded-xl shadow-xs"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                                Reference Link
                            </a>
                        )}
                    </div>
                    {header.instructions && (
                        <div className="bg-amber-50 border border-amber-200/60 px-5 py-3.5 rounded-2xl text-sm text-slate-700 leading-relaxed shadow-xs">
                            {header.instructions}
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
};

const GroupedQuestionsRenderer = ({ groupedItems, answers, handleAnswerChange, submitted, result, activeSet }) => {
    return (
        <div className="space-y-8">
            {groupedItems.map((groupEntry, geIdx) => {
                const isGroup = groupEntry.type === 'group';
                
                const children = groupEntry.visuals.map((vg, vgIdx) => {
                    if (vg.type === 'matching-grid-group') {
                        return (
                            <div key={`grid-${geIdx}-${vgIdx}`} className="space-y-4 p-6 rounded-3xl border border-base-200 bg-white shadow-xs animate-fadeIn">
                                <h3 className="text-lg font-black uppercase tracking-widest text-primary/40 pl-2">
                                    Matching Grid
                                </h3>
                                <MatchingGridRenderer
                                    questions={vg.questions}
                                    options={vg.options}
                                    answers={answers}
                                    onAnswerChange={handleAnswerChange}
                                    submitted={submitted}
                                    result={result}
                                    activeSet={activeSet}
                                />
                            </div>
                        );
                    }

                    const q = vg.question;
                    const idx = activeSet.questions.findIndex(item => item.id === q.id);
                    const isCorrect = submitted && result?.evaluatedAnswers?.find(a => a.questionId === q.id)?.isCorrect;

                    return (
                        <div 
                            key={q.id || idx} 
                            id={`question-${idx}`}
                            className="space-y-4 scroll-mt-6 animate-fadeIn"
                        >
                            <QuestionRenderer
                                q={q}
                                idx={idx}
                                submitted={submitted}
                                answers={answers}
                                handleAnswerChange={handleAnswerChange}
                                isCorrect={isCorrect}
                                correctAnswer={q.correctAnswer}
                            />
                        </div>
                    );
                });

                if (isGroup) {
                    return (
                        <GroupedContainer key={`group-${geIdx}`} header={groupEntry.header}>
                            {children}
                        </GroupedContainer>
                    );
                }

                return (
                    <div key={`ungrouped-${geIdx}`} className="space-y-8">
                        {children}
                    </div>
                );
            })}
        </div>
    );
};

const Reading = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserProfile();
  const targetExam = userData?.targetExam || "IELTS";

  const [readingSets, setReadingSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const { answers, setAnswers, handleAnswerChange } = useAnswers({});
  const [loading, setLoading] = useState(true);
  const { submitting, submitted, setSubmitted, result, setResult, evaluate } = useEvaluate();
  const [activePassageTab, setActivePassageTab] = useState(0);

  const [toolbar, setToolbar] = useState({ show: false, x: 0, y: 0, range: null });
  const [activeNote, setActiveNote] = useState({ show: false, text: "", element: null, x: 0, y: 0 });
  const lastShownRef = useRef(0);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Hide selection toolbar if clicking away (outside both the toolbar and the passage container)
      if (toolbar.show && !e.target.closest("[data-highlight-toolbar]") && !e.target.closest("[data-passage-container]")) {
        setToolbar((prev) => ({ ...prev, show: false }));
      }
      // Close active sticky note editor if clicking away from it and from highlights
      if (activeNote.show && !e.target.closest("[data-note-popover]") && !e.target.closest("[data-highlight]")) {
        setActiveNote({ show: false, text: "", element: null, x: 0, y: 0 });
      }
    };

    document.addEventListener("pointerdown", handleGlobalClick);
    return () => document.removeEventListener("pointerdown", handleGlobalClick);
  }, [toolbar.show, activeNote.show]);

  const handleTextSelection = (e) => {
    const container = e.currentTarget;
    
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
        // If the toolbar was shown very recently (within 300ms), ignore the collapsed check
        // to prevent trackpad pointer-up bounces/micro-clicks from hiding the toolbar.
        if (Date.now() - lastShownRef.current < 300) {
          return;
        }
        setToolbar((prev) => ({ ...prev, show: false }));
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) {
          return;
        }

        const rect = range.getBoundingClientRect();
        setToolbar({
          show: true,
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY - 45,
          range: range.cloneRange()
        });
        lastShownRef.current = Date.now();
      } catch (err) {
        console.debug("Highlight range capture skipped:", err);
      }
    }, 80);
  };

  const applyHighlight = (colorClass) => {
    if (!toolbar.range) return;

    const span = document.createElement("mark");
    span.className = `${colorClass} text-slate-900 cursor-pointer rounded px-0.5 transition-all hover:opacity-90 relative`;
    span.setAttribute("data-highlight", "true");
    span.setAttribute("data-color", colorClass);
    span.setAttribute("data-note", "");

    // Set inline styles to completely bypass Tailwind/prose specificity overrides!
    if (colorClass.includes("bg-emerald-200")) {
      span.style.backgroundColor = "#a7f3d0"; // Emerald 200
    } else if (colorClass.includes("bg-sky-200")) {
      span.style.backgroundColor = "#bae6fd"; // Sky 200
    }

    span.onclick = (e) => {
      e.stopPropagation();
    };

    try {
      toolbar.range.surroundContents(span);
    } catch (err) {
      console.warn("surroundContents failed, trying extractContents fallback:", err);
      try {
        const fragment = toolbar.range.extractContents();
        span.appendChild(fragment);
        toolbar.range.insertNode(span);
      } catch (innerErr) {
        console.error("Highlight extraction fallback failed:", innerErr);
      }
    }

    window.getSelection().removeAllRanges();
    setToolbar({ show: false, x: 0, y: 0, range: null });
  };

//   const openNoteModal = (element) => {
//     const rect = element.getBoundingClientRect();
//     const noteText = element.getAttribute("data-note") || "";
//     setActiveNote({
//       show: true,
//       text: noteText,
//       element: element,
//       x: rect.left + window.scrollX + rect.width / 2,
//       y: rect.top + window.scrollY + rect.height + 10
//     });
//   };




  // Fullscreen & Gating States
  const [isStarted, setIsStarted] = useState(false);
  const { isFullscreen, showWarning, setShowWarning, enterFullscreen, exitFullscreen } = useTestIntegrity(isStarted, submitted);

  // Fetch reading data
  useEffect(() => {
    const fetchReading = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get("/questions?type=reading");
        const fetchedSets = response?.data?.questions || [];
        setReadingSets(fetchedSets);
        // Removed auto-selection of the first set
        setLoading(false);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Failed to load reading materials");
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchReading();
    }
  }, [axiosSecure, user?.email]);

  const activeSet = useMemo(
    () => readingSets.find((set) => set._id === selectedSetId) || null,
    [readingSets, selectedSetId],
  );

  const { timeLeft, fmtTime } = useCountdown(3600, !!selectedSetId, submitted);

  const passageElement = useMemo(() => {
    if (!activeSet) return null;
    const contentHTML = (activeSet.passages && activeSet.passages.length > 0)
      ? convertMarkdownContentToHtml(activeSet.passages[activePassageTab]?.content || "")
      : convertMarkdownContentToHtml(activeSet.passage || "");

    return (
      <div
        data-passage-container="true"
        onMouseUp={handleTextSelection}
        onPointerUp={handleTextSelection}
        dangerouslySetInnerHTML={{ __html: contentHTML }}
        className="text-lg leading-relaxed text-slate-600 text-justify select-text"
      />
    );
  }, [activeSet, activePassageTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await evaluate(activeSet, answers);
  };

  const handleExitTest = async () => {
    if (submitted) {
      exitFullscreen();
      setIsStarted(false);
      setSelectedSetId("");
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      return;
    }

    const hasAnswers = Object.keys(answers).length > 0;
    const result = hasAnswers
      ? await alerts.confirmExitPractice("Reading Practice Lab")
      : await alerts.confirmCancelPractice("Reading Practice Lab");

    if (result.isConfirmed) {
      exitFullscreen();
      setIsStarted(false);

      if (hasAnswers) {
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

      setSelectedSetId("");
      setAnswers({});
      setSubmitted(false);
      setResult(null);
    } else if (result.isDenied) {
      exitFullscreen();
      setIsStarted(false);

      Object.keys(localStorage).forEach((key) => {
        if (key.includes("test_cache") || key.includes("test_scratchpad") || key.includes("reading")) {
          localStorage.removeItem(key);
        }
      });

      toast.info("Practice cancelled. Answers discarded.");
      setSelectedSetId("");
      setAnswers({});
      setSubmitted(false);
      setResult(null);
    }
  };

  const handleReturnToDashboard = () => {
    exitFullscreen();
    setIsStarted(false);
    navigate("/dashboard");
  };

  if (loading) return <Loader />;

  if (!activeSet || !selectedSetId) {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-2 pb-20">
            <div className="text-center space-y-4 mb-16">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${
                    readingSets.length > 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                    <PiBookOpenFill /> {readingSets.length} Modules Available
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-slate-800">Select a <span className="text-primary italic">Reading Lab</span></h2>
                <p className="text-slate-400 font-medium text-lg">Choose a comprehensive passage to sharpen your analytical skills.</p>
            </div>

            {readingSets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto"
                >
                    <div className="card bg-white border-2 border-dashed border-base-300 p-16 rounded-[3rem] text-center space-y-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center justify-center text-4xl mx-auto">
                            📖
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight text-slate-800">
                                No Reading Modules Yet
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                No reading content is available for your current exam track{" "}
                                <span className="font-black text-primary">({targetExam})</span>.
                                This could be because:
                            </p>
                        </div>
                        <ul className="text-left space-y-3 text-sm text-slate-500 font-medium">
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">1</span>
                                The admin hasn't uploaded any reading passages for <strong>{targetExam}</strong> yet.
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
                    {readingSets.map((set, idx) => (
                        <motion.div 
                            key={set._id}
                            whileHover={{ y: -10 }}
                            className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm hover:shadow-2xl hover:border-primary/30 cursor-pointer group transition-all"
                            onClick={() => {
                              setActivePassageTab(0);
                              setSelectedSetId(set._id);
                            }}
                        >
                            <div className="flex flex-col h-full space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                        <PiBookOpenFill />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-base-content/20">Module {idx + 1}</span>
                                </div>
                                <h3 className="text-xl font-black group-hover:text-primary transition-colors">{set.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                                    <span className="flex items-center gap-1.5"><PiClockFill /> 60m</span>
                                    <span className="flex items-center gap-1.5"><PiChartLineUpFill /> {set.questions?.length} Qs</span>
                                    {set.examType && (
                                        <span className={`badge badge-sm font-black ${
                                            set.examType === 'IELTS' ? 'badge-primary' :
                                            set.examType === 'PTE' ? 'badge-success' : 'badge-warning'
                                        }`}>{set.examType}</span>
                                    )}
                                </div>
                                <button className="btn btn-block rounded-2xl h-14 bg-slate-900 text-white border-none group-hover:bg-primary transition-all font-black uppercase tracking-widest text-xs">
                                    Open Module
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
  }

  return (
    <TestShell
      isStarted={isStarted}
      onStart={() => { setIsStarted(true); enterFullscreen(); }}
      onCancel={() => setSelectedSetId("")}
      title="Ready to Start?"
      description="This practice test will open in fullscreen mode. Ensure you are in a quiet environment."
      icon={PiBookOpenFill}
      isFullscreen={isFullscreen}
      showWarning={showWarning}
      onWarningResume={() => { setShowWarning(false); enterFullscreen(); }}
      onWarningExit={handleExitTest}
    >

      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={handleExitTest} className="btn btn-ghost btn-circle text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <PiArrowLeftBold />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{activeSet?.title}</h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Reading Practice</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {!submitted && (
                    <div className={`badge ${timeLeft < 300 ? 'bg-red-500 text-white animate-pulse' : 'badge-neutral'} p-4 rounded-xl font-black flex gap-2 border-none`}>
                        <PiClockFill /> {fmtTime(timeLeft)}
                    </div>
                )}
                <div className="h-10 w-px bg-slate-200" />
                {submitted ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                      <PiCheckCircleFill className="text-xl" /> Session Finalized
                    </div>
                    <button
                      onClick={handleReturnToDashboard}
                      className="btn btn-primary btn-sm rounded-2xl px-4 h-10 font-black text-[10px] uppercase tracking-widest"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleExitTest}
                    className="btn btn-error text-white rounded-2xl px-8 h-12 font-black border-none shadow-xl shadow-error/20"
                  >
                    End Session
                  </button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {submitted && result && (
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card bg-linear-to-r from-primary to-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 mb-10 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl font-black backdrop-blur-md border border-white/20">
                        {result.score}%
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Practice Performance</h2>
                        <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-1">
                            {result.correctAnswers} Correct of {result.totalQuestions} Questions
                        </p>
                    </div>
                </div>
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* Passage Side */}
            <div className="lg:col-span-3 space-y-6">
                <div className="card bg-white p-10 rounded-[3rem] border border-base-300 shadow-sm h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-3xl font-black tracking-tight mb-8 text-slate-800">{activeSet.title}</h2>
                        {activeSet.passages && activeSet.passages.length > 0 && (
                            <div className="flex border-b border-slate-200 mb-8 gap-2 overflow-x-auto">
                                {activeSet.passages.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setActivePassageTab(idx);
                                        }}
                                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                                            activePassageTab === idx
                                                ? "border-primary text-primary font-black bg-primary/5 rounded-t-xl"
                                                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-t-xl"
                                        }`}
                                    >
                                        Passage {idx + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                        {activeSet.passages && activeSet.passages.length > 0 && activeSet.passages[activePassageTab] && (
                            <h3 className="text-2xl font-black tracking-tight mb-6 text-slate-700">
                                {activeSet.passages[activePassageTab].title}
                            </h3>
                        )}
                        {passageElement}
                    </div>
                </div>
            </div>

            {/* Questions Side */}
            <div className="lg:col-span-2 space-y-6">
                <div className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black tracking-tight">Question Panel</h2>
                        <PiBookOpenFill className="text-2xl text-primary/20" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {(() => {
                            const groups = groupQuestions(activeSet.questions || []);
                            const groupedItems = groupVisualsByQuestionGroups(groups, activeSet.questionGroups, 0, activeSet.questions || []);
                            return (
                                <GroupedQuestionsRenderer
                                    groupedItems={groupedItems}
                                    answers={answers}
                                    handleAnswerChange={handleAnswerChange}
                                    submitted={submitted}
                                    result={result}
                                    activeSet={activeSet}
                                />
                            );
                        })()}

                        {!submitted && (
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="btn btn-primary btn-block rounded-3xl h-16 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                            >
                                {submitting ? <span className="loading loading-spinner" /> : "Verify Performance"}
                                <PiArrowRightBold />
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
      </div>

      {/* Floating Highlight Action Toolbar */}
      {toolbar.show && (
          <div 
              data-highlight-toolbar="true"
              className="absolute z-[100] flex items-center gap-2 p-2 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md -translate-x-1/2"
              style={{ top: `${toolbar.y}px`, left: `${toolbar.x}px` }}
          >
              <button 
                  onClick={() => applyHighlight("bg-emerald-200")}
                  className="w-6 h-6 rounded-full bg-emerald-200 hover:scale-110 active:scale-95 transition-transform border border-white/20"
                  title="Green"
              />
              <button 
                  onClick={() => applyHighlight("bg-sky-200")}
                  className="w-6 h-6 rounded-full bg-sky-200 hover:scale-110 active:scale-95 transition-transform border border-white/20"
                  title="Blue"
              />
          </div>
      )}


    </TestShell>
  );
};

export default Reading;
