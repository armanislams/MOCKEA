import { motion } from "framer-motion";
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
    const options   = q.options || pairs.map((p) => p.value).filter(Boolean);

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
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: activeSet.passage }}
                    />
                )}

                {/* ── Questions ───────────────────────────────────────── */}
                <div className="space-y-4">
                    {activeSet.questions?.map((q, idx) => (
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IeltsListeningFormat;
