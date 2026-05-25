import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiHeadphonesFill, PiCheckCircleFill, PiXCircleFill } from "react-icons/pi";
import { toast } from "react-toastify";

/**
 * IeltsListeningFormat
 * Renders a British-Council-style IELTS Form/Note Completion layout.
 * 
 * Props:
 *   activeSet      — the question set object (with .passage, .questions, .audioUrl)
 *   answers        — { [questionId]: string } answer state
 *   onAnswerChange — (questionId, value) => void
 *   submitted      — boolean
 *   result         — evaluation result object or null
 */
const IeltsListeningFormat = ({ activeSet, answers, onAnswerChange, submitted, result }) => {
    if (!activeSet) return null;

    return (
        <div className="card bg-white p-10 rounded-[3.5rem] border border-base-300 shadow-sm relative overflow-hidden">
            {/* Faint background watermark */}
            <div className="absolute top-0 right-0 p-10 text-primary/5 text-9xl pointer-events-none select-none">
                <PiHeadphonesFill />
            </div>

            <div className="relative z-10 space-y-8">
                {/* Section header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tighter italic text-slate-800">
                        Note Completion
                    </h2>
                    <span className="badge badge-primary px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        Questions 1–{activeSet.questions.length}
                    </span>
                </div>

                {/* Instruction strip */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 leading-relaxed">
                    <span className="text-primary font-black uppercase tracking-widest text-[10px] block mb-1">Instructions</span>
                    {activeSet.instructions || "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer."}
                </div>

                {/* British Council Example Box — pre-filled */}
                {activeSet.passage && (
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: activeSet.passage }}
                    />
                )}

                {/* Inline Question Rows */}
                <div className="space-y-5">
                    {activeSet.questions.map((q, idx) => {
                        const evaluation = result?.evaluatedAnswers?.find(a => a.questionId === q.id);
                        const isCorrect = evaluation?.isCorrect;

                        return (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                    submitted
                                        ? isCorrect
                                            ? "bg-emerald-50/60 border-emerald-300/40"
                                            : "bg-red-50/60 border-red-300/40"
                                        : "bg-slate-50/60 border-slate-200 hover:border-primary/30"
                                }`}
                            >
                                {/* Question number badge */}
                                <div className="w-8 h-8 rounded-xl bg-white border border-base-300 shadow-sm flex items-center justify-center font-black text-xs text-slate-700 flex-shrink-0">
                                    {idx + 1}
                                </div>

                                {/* Question label */}
                                <span className="font-semibold text-sm text-slate-700 flex-shrink-0 min-w-[120px]">
                                    {q.question}
                                </span>

                                {/* Inline answer input */}
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        disabled={submitted}
                                        className={`w-full h-10 px-4 rounded-xl border text-sm font-bold bg-white transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-70 ${
                                            submitted
                                                ? isCorrect
                                                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                                    : "border-red-400 bg-red-50 text-red-700"
                                                : "border-base-300"
                                        }`}
                                        placeholder={`Answer ${idx + 1}`}
                                        value={answers[q.id] || ""}
                                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                    />
                                </div>

                                {/* Result icon */}
                                {submitted && (
                                    <div className="flex-shrink-0">
                                        {isCorrect
                                            ? <PiCheckCircleFill className="text-emerald-500 text-2xl" />
                                            : <PiXCircleFill className="text-red-500 text-2xl" />
                                        }
                                    </div>
                                )}

                                {/* Show correct answer when wrong */}
                                {submitted && !isCorrect && (
                                    <div className="flex-shrink-0 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1">
                                        ✓ {q.correctAnswer}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IeltsListeningFormat;
