import { useMemo, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { collapseListeningExampleBlocks } from "../../../../utils/listeningPassage";

const EMPTY_ARRAY = [];
import {
    PiHeadphonesFill,
    PiCheckCircleFill,
    PiXCircleFill,
    PiListBullets,
    PiArrowsLeftRight,
    PiMapTrifold,
    PiTextT,
} from "react-icons/pi";

// ─── Constants ────────────────────────────────────────────────────────────────

const PART_META = {
    1: { label: "Part 1", context: "Social Conversation",    instruction: "Complete the form. Write ONE WORD AND/OR A NUMBER for each answer." },
    2: { label: "Part 2", context: "Social Monologue",       instruction: "Choose the correct letter A, B, or C." },
    3: { label: "Part 3", context: "Academic Discussion",    instruction: "Choose the correct letter, A, B or C. Write answers in boxes on your answer sheet." },
    4: { label: "Part 4", context: "Academic Lecture",       instruction: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer." },
};

// Which types render an inline fill-in input
const COMPLETION_TYPES = new Set([
    "short-answer",
    "sentence-completion",
    "summary-completion",
    "table-completion",
    "flow-chart-completion",
]);

const convertMarkdownTablesToHtml = (text) => {
    if (!text) return "";
    
    let hasWrapper = false;
    let wrapperClass = "ielts-listening-notes space-y-4";
    let cleanedText = text.trim();
    
    const wrapperMatch = cleanedText.match(/^<div class=["'](ielts-listening-notes[^"']*)["']>/);
    if (wrapperMatch && cleanedText.endsWith("</div>")) {
        hasWrapper = true;
        wrapperClass = wrapperMatch[1];
        cleanedText = cleanedText.substring(wrapperMatch[0].length, cleanedText.length - 6).trim();
    }

    const lines = cleanedText.split("\n");
    let inTable = false;
    let tableHtml = "";
    const result = [];
    let rowCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("|") && line.endsWith("|")) {
            if (!inTable) {
                inTable = true;
                tableHtml = '<div class="overflow-x-auto my-6"><table class="table-auto w-full text-left border-collapse border border-slate-200 text-sm">';
                rowCount = 0;
            }
            const cells = line.split("|").slice(1, -1).map(c => c.trim());
            const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
            if (isSeparator) {
                if (tableHtml.includes("<thead>") && !tableHtml.includes("</thead>")) {
                    tableHtml += "</thead><tbody class=\"text-slate-700\">";
                }
                continue;
            }
            if (!tableHtml.includes("<thead>")) {
                tableHtml += "<thead><tr class=\"bg-slate-100 text-slate-800 font-bold\">";
                cells.forEach(c => {
                    tableHtml += `<th class="border border-slate-200 p-3">${c}</th>`;
                });
                tableHtml += "</tr>";
            } else {
                const rowClass = rowCount % 2 === 1 ? "bg-slate-50/30" : "";
                tableHtml += `<tr class="${rowClass}">`;
                cells.forEach(c => {
                    tableHtml += `<td class="border border-slate-200 p-3">${c}</td>`;
                });
                tableHtml += "</tr>";
                rowCount++;
            }
        } else {
            if (inTable) {
                inTable = false;
                if (tableHtml.includes("<tbody>") && !tableHtml.includes("</tbody>")) {
                    tableHtml += "</tbody>";
                } else if (tableHtml.includes("<thead>") && !tableHtml.includes("</thead>")) {
                    tableHtml += "</thead>";
                }
                tableHtml += "</table></div>";
                result.push(tableHtml);
                tableHtml = "";
            }
            result.push(lines[i]);
        }
    }
    if (inTable) {
        if (tableHtml.includes("<tbody>") && !tableHtml.includes("</tbody>")) {
            tableHtml += "</tbody>";
        } else if (tableHtml.includes("<thead>") && !tableHtml.includes("</thead>")) {
            tableHtml += "</thead>";
        }
        tableHtml += "</table></div>";
        result.push(tableHtml);
    }
    
    const finalHtml = result.join("\n");
    return hasWrapper ? `<div class="${wrapperClass}">${finalHtml}</div>` : finalHtml;
};

/**
 * Renders the passage text and replaces ___[number]___ placeholders with React inline inputs.
 * If no placeholders are present, it renders the raw HTML.
 */
const InlinePassage = memo(({ passage, questions, answers, onAnswerChange, submitted, result, offset, className = "leading-relaxed text-slate-700" }) => {
    const containerRef = useRef(null);

    const questionsKey = useMemo(() => questions.map(q => q.id).join(","), [questions]);
    const resultKey = useMemo(() => result ? JSON.stringify(result.evaluatedAnswers?.map(a => `${a.questionId}:${a.isCorrect}`)) : "", [result]);

    const processedPassage = useMemo(() => {
        const text = convertMarkdownTablesToHtml(collapseListeningExampleBlocks(passage));
        const hasInlinePlaceholders = /___([\w-]+)___/.test(text);
        if (!hasInlinePlaceholders) {
            return text;
        }

        return text.replace(/___([\w-]+)___/g, (match, matchKey) => {
            const q = questions.find((item, idx) => {
                const questionNum = offset + idx + 1;
                const localIndex = idx + 1;
                return (
                    item.id === matchKey ||
                    questionNum.toString() === matchKey ||
                    localIndex.toString() === matchKey
                );
            });
            if (!q) return match;

            const qIndexInSet = questions.indexOf(q);
            const labelNum = offset + qIndexInSet + 1;

            const qId = q.id;
            const evaluation = result?.evaluatedAnswers?.find((a) => a.questionId === qId);
            const isCorrect = evaluation?.isCorrect;
            
            const isMockTest = submitted === undefined;
            
            let inputClass = "inline-block px-3 py-1 text-sm font-bold bg-white border-2 rounded-lg outline-none transition-all text-center focus:ring-2 focus:ring-primary/20 w-36";
            if (isMockTest) {
                inputClass = "inline-block h-10 px-3 py-1 rounded-xl w-36 font-bold border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-center outline-none bg-white transition-all";
            } else if (submitted) {
                inputClass += isCorrect
                    ? " border-emerald-400 bg-emerald-50 text-emerald-700"
                    : " border-red-400 bg-red-50 text-red-700";
            } else {
                inputClass += " border-slate-300 focus:border-primary hover:border-slate-400";
            }

            let badgeHtml = "";
            if (!isMockTest && submitted) {
                badgeHtml = isCorrect
                    ? `<span class="badge badge-success text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✓</span>`
                    : `<span class="badge badge-error text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✗</span>`;
            }

            let tooltipHtml = "";
            if (!isMockTest && submitted && !isCorrect) {
                tooltipHtml = `<span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg z-50 whitespace-nowrap">✓ ${q.correctAnswer}</span>`;
            }

            const titleAttr = (!isMockTest && submitted && !isCorrect) ? `Correct Answer: ${q.correctAnswer}` : "";

            return `
                <span class="inline-flex items-center gap-1 mx-1.5 relative group align-baseline">
                    <input
                        type="text"
                        data-q-id="${qId}"
                        ${(!isMockTest && submitted) ? "disabled" : ""}
                        placeholder="(${labelNum})"
                        value=""
                        class="${inputClass}"
                        title="${titleAttr}"
                    />
                    ${badgeHtml}
                    ${tooltipHtml}
                </span>
            `.trim();
        });
    }, [passage, questionsKey, submitted, resultKey, offset]);

    useEffect(() => {
        if (containerRef.current) {
            const inputs = containerRef.current.querySelectorAll('input[data-q-id]');
            inputs.forEach(input => {
                const qId = input.getAttribute('data-q-id');
                const value = answers[qId] || "";
                if (input.value !== value) {
                    input.value = value;
                }
            });
        }
    }, [answers, processedPassage]);

    const onAnswerChangeRef = useRef(onAnswerChange);
    useEffect(() => {
        onAnswerChangeRef.current = onAnswerChange;
    }, [onAnswerChange]);

    useEffect(() => {
        const handleInput = (e) => {
            if (e.target && e.target.hasAttribute('data-q-id')) {
                const qId = e.target.getAttribute('data-q-id');
                onAnswerChangeRef.current(qId, e.target.value);
            }
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener('input', handleInput);
        }
        return () => {
            if (container) {
                container.removeEventListener('input', handleInput);
            }
        };
    }, []);

    const dangerouslySetHtml = useMemo(() => ({ __html: processedPassage }), [processedPassage]);

    return (
        <div 
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={dangerouslySetHtml}
        />
    );
});

// ─── Per-question-type renderers ─────────────────────────────────────────────

/** Inline text input — note/form/sentence/summary/table/flow-chart completion */
const CompletionRenderer = ({ q, idx, offset = 0, submitted, evaluation, answers, onAnswerChange }) => {
    const isCorrect = evaluation?.isCorrect;
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all ${
            submitted
                ? isCorrect
                    ? "bg-emerald-50/60 border-emerald-300/40"
                    : "bg-red-50/60 border-red-300/40"
                : "bg-slate-50/60 border-slate-200 hover:border-primary/30"
        }`}>
            <div className="flex items-center gap-4 flex-1">
                {/* Number badge */}
                <div className="w-8 h-8 rounded-xl bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-xs text-slate-700 flex-shrink-0">
                    {offset + idx + 1}
                </div>

                {/* Label */}
                <span className="font-semibold text-sm text-slate-700 flex-1 leading-relaxed">
                    {q.question}
                </span>
            </div>

            {/* Input */}
            <div className="w-full sm:w-48 md:w-64 flex-shrink-0">
                <input
                    type="text"
                    disabled={submitted}
                    className={`w-full h-11 px-4 rounded-xl border text-sm font-bold bg-white transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-70 ${
                        submitted
                            ? isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                : "border-red-400 bg-red-50 text-red-700"
                            : "border-base-300 focus:border-primary"
                    }`}
                    placeholder={`Answer ${offset + idx + 1}`}
                    value={answers[q.id] || ""}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                />
            </div>

            {/* Result icons */}
            {submitted && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isCorrect
                        ? <PiCheckCircleFill className="text-emerald-500 text-2xl flex-shrink-0" />
                        : <PiXCircleFill className="text-red-500 text-2xl flex-shrink-0" />
                    }
                    {!isCorrect && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1 flex-shrink-0">
                            ✓ {q.correctAnswer}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

/** Radio option cards — multiple choice / true-false / yes-no */
const McqRenderer = ({ q, idx, offset = 0, submitted, evaluation, answers, onAnswerChange }) => {
    const isCorrect = evaluation?.isCorrect;
    const selected  = answers[q.id] || "";
    const options   = q.options?.length ? q.options : ["True", "False", "Not Given"];

    return (
        <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            submitted
                ? isCorrect ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                : "bg-slate-50/40 border-slate-200"
        }`}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-xs text-slate-700 flex-shrink-0">
                    {offset + idx + 1}
                </div>
                <span className="font-semibold text-sm text-slate-700">{q.question}</span>
                {submitted && (
                    isCorrect
                        ? <PiCheckCircleFill className="text-emerald-500 text-xl ml-auto flex-shrink-0" />
                        : <PiXCircleFill className="text-red-500 text-xl ml-auto flex-shrink-0" />
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-11">
                {options.map((opt, i) => {
                    const isSelected  = selected === opt;
                    const isAnswer    = submitted && opt === q.correctAnswer;
                    return (
                        <label
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                                submitted
                                    ? isAnswer
                                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                        : isSelected && !isAnswer
                                            ? "border-red-400 bg-red-50 text-red-600"
                                            : "border-base-200 text-base-content/40"
                                    : isSelected
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-base-200 hover:border-primary/40"
                            }`}
                        >
                            <input
                                type="radio"
                                className="radio radio-primary radio-sm"
                                name={q.id}
                                value={opt}
                                checked={isSelected}
                                disabled={submitted}
                                onChange={() => onAnswerChange(q.id, opt)}
                            />
                            <span className="font-black text-[10px] w-5 text-center shrink-0">
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </label>
                    );
                })}
            </div>
            {submitted && !isCorrect && (
                <p className="pl-11 text-[10px] font-black text-emerald-600">
                    ✓ Correct: {q.correctAnswer}
                </p>
            )}
        </div>
    );
};

/** Dropdown per item — matching / heading-matching */
const MatchingRenderer = ({ q, idx, offset = 0, submitted, evaluation, answers, onAnswerChange }) => {
    const isCorrect = evaluation?.isCorrect;
    const pairs     = q.matchingPairs || [];
    const options   = (q.options?.length && q.options.some(opt => opt && opt.trim() !== ""))
        ? q.options.filter(opt => opt && opt.trim() !== "")
        : pairs.map((p) => p.value).filter(Boolean);

    return (
        <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            submitted
                ? isCorrect ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                : "bg-slate-50/40 border-slate-200"
        }`}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-xs text-slate-700 flex-shrink-0">
                    {offset + idx + 1}
                </div>
                <span className="font-semibold text-sm text-slate-700">{q.question}</span>
                {submitted && (
                    isCorrect
                        ? <PiCheckCircleFill className="text-emerald-500 text-xl ml-auto flex-shrink-0" />
                        : <PiXCircleFill className="text-red-500 text-xl ml-auto flex-shrink-0" />
                )}
            </div>
            <div className="pl-11 flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600 flex-shrink-0">→</span>
                <select
                    disabled={submitted}
                    className={`select select-bordered select-sm rounded-xl flex-1 ${
                        submitted
                            ? isCorrect ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50"
                            : ""
                    }`}
                    value={answers[q.id] || ""}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                >
                    <option value="">— Select a match —</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            {submitted && !isCorrect && (
                <p className="pl-11 text-[10px] font-black text-emerald-600">
                    ✓ Correct: {q.correctAnswer}
                </p>
            )}
        </div>
    );
};

/** Image + numbered input — map/diagram labelling */
const MapLabellingRenderer = ({ q, idx, offset = 0, submitted, evaluation, answers, onAnswerChange }) => {
    const isCorrect = evaluation?.isCorrect;
    return (
        <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            submitted
                ? isCorrect ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                : "bg-slate-50/40 border-slate-200"
        }`}>
            {q.imageUrl && (
                <img
                    src={q.imageUrl}
                    alt={`Map / Diagram for Q${offset + idx + 1}`}
                    className="w-full max-h-64 object-contain rounded-2xl border border-base-200 bg-white"
                />
            )}
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-xs text-slate-700 flex-shrink-0">
                    {offset + idx + 1}
                </div>
                <span className="font-semibold text-sm text-slate-700 flex-shrink-0 min-w-[120px]">
                    {q.question}
                </span>
                <input
                    type="text"
                    disabled={submitted}
                    className={`flex-1 h-10 px-4 rounded-xl border text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70 ${
                        submitted
                            ? isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700"
                            : "border-base-300"
                    }`}
                    placeholder={`Label ${offset + idx + 1}`}
                    value={answers[q.id] || ""}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                />
                {submitted && (
                    isCorrect
                        ? <PiCheckCircleFill className="text-emerald-500 text-2xl flex-shrink-0" />
                        : <PiXCircleFill className="text-red-500 text-2xl flex-shrink-0" />
                )}
            </div>
            {submitted && !isCorrect && (
                <p className="pl-11 text-[10px] font-black text-emerald-600">✓ {q.correctAnswer}</p>
            )}
        </div>
    );
};

// ─── Question Router ─────────────────────────────────────────────────────────

/** Picks the right renderer based on question type */
const QuestionRenderer = ({ q, idx, offset = 0, submitted, result, answers, onAnswerChange }) => {
    const evaluation = result?.evaluatedAnswers?.find((a) => a.questionId === q.id);
    const props      = { q, idx, offset, submitted, evaluation, answers, onAnswerChange };

    if (COMPLETION_TYPES.has(q.type))           return <CompletionRenderer {...props} />;
    if (["multiple-choice","true-false","yes-no"].includes(q.type)) return <McqRenderer {...props} />;
    if (["matching","heading-matching"].includes(q.type))           return <MatchingRenderer {...props} />;
    if (["map-labelling","diagram-labelling"].includes(q.type))     return <MapLabellingRenderer {...props} />;

    // Fallback — same as completion
    return <CompletionRenderer {...props} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * IeltsListeningFormat
 *
 * Props:
 *   activeSet      — question set object (passage, questions, listeningPart, audioUrl)
 *   answers        — { [questionId]: string }
 *   onAnswerChange — (questionId, value) => void
 *   submitted      — boolean
 *   result         — evaluation result or null
 */
const IeltsListeningFormat = ({ activeSet, answers, onAnswerChange, submitted, result }) => {
    if (!activeSet) return null;

    const part = activeSet.listeningPart || 1;
    const meta = PART_META[part] || PART_META[1];
    const offset = (part - 1) * 10;

    const renderedInlineIds = useMemo(() => {
        if (!activeSet.passage) return new Set();
        const matches = activeSet.passage.match(/___([\w-]+)___/g) || [];
        const ids = new Set();
        
        matches.forEach(m => {
            const matchKey = m.replace(/___/g, "").trim();
            const q = activeSet.questions?.find((item, idx) => {
                const questionNum = offset + idx + 1;
                const localIndex = idx + 1;
                return (
                    item.id === matchKey ||
                    questionNum.toString() === matchKey ||
                    localIndex.toString() === matchKey
                );
            });
            if (q) {
                ids.add(q.id);
            }
        });
        return ids;
    }, [activeSet.passage, activeSet.questions, offset]);

    const remainingQuestions = useMemo(() => {
        return activeSet.questions?.filter(q => !renderedInlineIds.has(q.id)) || [];
    }, [activeSet.questions, renderedInlineIds]);

    return (
        <div className="card bg-white p-10 rounded-[3.5rem] border border-base-300 shadow-sm relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute top-0 right-0 p-10 text-primary/5 text-9xl pointer-events-none select-none">
                <PiHeadphonesFill />
            </div>

            <div className="relative z-10 space-y-8">

                {/* ── Part context banner ─────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="badge badge-primary px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                {meta.label}
                            </span>
                            <h2 className="text-2xl font-black tracking-tighter text-slate-800">
                                {meta.context}
                            </h2>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 pl-1">
                            Questions {offset + 1}–{offset + (activeSet.questions?.length || 0)}
                        </p>
                    </div>
                </div>

                {/* ── Instruction strip ───────────────────────────────── */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 leading-relaxed">
                    <span className="text-primary font-black uppercase tracking-widest text-[10px] block mb-1">
                        Instructions
                    </span>
                    {activeSet.instructions || meta.instruction}
                </div>

                {/* ── Example box (compiled from passage HTML) ────────── */}
                {activeSet.passage && activeSet.passage.trim() !== "" && (
                    <div className="prose prose-sm max-w-none">
                        <InlinePassage
                            passage={activeSet.passage}
                            questions={activeSet.questions || EMPTY_ARRAY}
                            answers={answers}
                            onAnswerChange={onAnswerChange}
                            submitted={submitted}
                            result={result}
                            offset={offset}
                        />
                    </div>
                )}

                {/* ── Questions ───────────────────────────────────────── */}
                {remainingQuestions.length > 0 && (
                    <div className="space-y-4">
                        {remainingQuestions.map((q) => {
                            const idx = activeSet.questions.findIndex(item => item.id === q.id);
                            return (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <QuestionRenderer
                                        q={q}
                                        idx={idx}
                                        offset={offset}
                                        submitted={submitted}
                                        result={result}
                                        answers={answers}
                                        onAnswerChange={onAnswerChange}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IeltsListeningFormat;
