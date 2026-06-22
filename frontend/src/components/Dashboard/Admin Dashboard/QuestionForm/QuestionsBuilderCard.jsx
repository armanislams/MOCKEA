import { useState } from "react";
import { 
    PiPlusCircle, 
    PiPlus, 
    PiBookOpen, 
    PiTrash,
    PiInfo
} from "react-icons/pi";
import { QuestionTypeSelect, QuestionTypeExtras } from "./QuestionTypeFields";
import { NEEDS_OPTIONS } from "./questionFormConstants";

export default function QuestionsBuilderCard({
    testType,
    formData,
    handleAddQuestion,
    handleRemoveQuestion,
    updateQuestionField,
    handleAddOption,
    updateOption,
    handleRemoveOption,
    handleAddPair,
    updatePair,
}) {
    if (testType === "writing" || testType === "speaking") return null;

    const [showGuide, setShowGuide] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <PiPlusCircle className="text-primary" /> Questions
                    <span className="badge badge-primary badge-sm font-black">
                        {formData.questions?.length || 0}
                    </span>
                </h2>
                <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="btn btn-primary btn-sm rounded-full gap-2"
                >
                    <PiPlus /> Add Question
                </button>
            </div>

            <div className="collapse bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-3xl shadow-xs">
                <input 
                    type="checkbox" 
                    className="peer" 
                    checked={showGuide} 
                    onChange={() => setShowGuide(!showGuide)} 
                /> 
                <div className="collapse-title flex items-center gap-2 text-slate-700 font-extrabold text-sm cursor-pointer hover:bg-slate-200/40 transition-colors">
                    <PiInfo className="text-primary w-5 h-5" />
                    <span>Admin Guide: Question Types & Formatting Reference</span>
                    <span className="badge badge-sm font-black ml-auto bg-slate-200/80 border-none text-slate-500 uppercase tracking-widest text-[9px] px-2.5 py-2">
                        {showGuide ? "Hide Guide" : "Show Guide"}
                    </span>
                </div>
                <div className="collapse-content bg-white border-t border-slate-200/50 p-6 space-y-4">
                    <div className="grid md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed font-medium">
                        {/* Drag & Drop Card */}
                        <div className="space-y-2.5 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <h4 className="font-black text-sm text-primary uppercase tracking-wider">
                                Drag & Drop Completion
                            </h4>
                            <p>
                                Lets students drag options from a shared pool and drop them into inline gaps within text/passages.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <strong>Inline Gaps:</strong> In the passage content, place <code>___[Num]___</code> (e.g. <code>___1___</code> or <code>___2___</code>) where drop targets should go.
                                </li>
                                <li>
                                    <strong>Options Pool:</strong> Under the question, add the options (e.g., <code>A. option text</code>). Repeat the same pool list for all questions in the block.
                                </li>
                                <li>
                                    <strong>Answers:</strong> Set the exact choice text as the correct answer.
                                </li>
                            </ul>
                        </div>

                        {/* Flowchart Card */}
                        <div className="space-y-2.5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <h4 className="font-black text-sm text-emerald-700 uppercase tracking-wider">
                                Flowchart Completion
                            </h4>
                            <p>
                                Automatically groups questions of this type into a visual, vertically connected flow diagram layout.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <strong>Visual Connections:</strong> Centered boxes will be rendered and connected by downward arrows (↓).
                                </li>
                                <li>
                                    <strong>Labels:</strong> Use the <code>Question / Label</code> field to describe each step in the flowchart.
                                </li>
                                <li>
                                    <strong>Question Groups:</strong> Ensure questions are grouped in a matching Question Group sequence to organize the flowchart layout.
                                </li>
                            </ul>
                        </div>

                        {/* Table Completion Card */}
                        <div className="space-y-2.5 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <h4 className="font-black text-sm text-indigo-700 uppercase tracking-wider">
                                Table Completion
                            </h4>
                            <p>
                                Renders an inline interactive question table on the right side of the split screen next to the passage.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <strong>Table Format:</strong> In the <em>Group Instructions</em> field, write a standard markdown table (e.g. <code>| Header 1 | Header 2 |</code>).
                                </li>
                                <li>
                                    <strong>Placeholders:</strong> Add <code>___[Num]___</code> (e.g. <code>___1___</code>) inside table cells where students should input answers.
                                </li>
                                <li>
                                    <strong>Interactive Blanks:</strong> Blanks will automatically render as inputs (for typed answers) or dropzones (if drag-drop is selected).
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {formData.questions?.map((q, index) => {
                const questionNum = index + 1;
                const group = (testType === "reading" || testType === "listening")
                    ? (formData.questionGroups || []).find(g => Number(g.fromQuestion) === questionNum)
                    : null;

                return (
                    <div key={q.id} className="space-y-4">
                        {group && (
                            <div className="space-y-2 mt-8">
                                {/* Group header banner */}
                                <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary px-4 py-3 rounded-r-xl">
                                    <PiBookOpen className="text-primary w-5 h-5 flex-shrink-0" />
                                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                                        Questions {group.fromQuestion}–{group.toQuestion}
                                    </span>
                                    {group.title && (
                                        <span className="font-extrabold text-sm text-slate-800">
                                            · {group.title}
                                        </span>
                                    )}
                                    <span className="ml-auto text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                        📖 Passage {(group.passageIndex || 0) + 1}: {formData.passages?.[group.passageIndex || 0]?.title || "(Untitled)"}
                                    </span>
                                </div>
                                {/* Instructions preview */}
                                {group.instructions && (
                                    <div className="bg-amber-50 border border-amber-200/60 px-4 py-3 rounded-2xl text-sm text-slate-700 italic leading-snug">
                                        {group.instructions}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="card bg-white border border-base-300 shadow-sm p-6 space-y-4 relative group">
                            {/* Delete button */}
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(q.id)}
                                className="btn btn-ghost btn-xs btn-circle absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity animate-none"
                            >
                                <PiTrash className="w-4 h-4" />
                            </button>

                            {/* Question number chip */}
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-base-content/40">
                                    Question {index + 1}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Type picker */}
                                <div>
                                    <label className="label"><span className="label-text font-semibold text-xs">Type</span></label>
                                    <QuestionTypeSelect
                                        value={q.type}
                                        onChange={(val) => updateQuestionField(q.id, "type", val)}
                                    />
                                </div>
                                {/* Question text */}
                                <div className={testType === "reading" ? "md:col-span-1" : "md:col-span-2"}>
                                    <label className="label"><span className="label-text font-semibold text-xs">Question / Label</span></label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full rounded-2xl text-sm"
                                        placeholder="e.g. Name of the hotel:"
                                        value={q.question}
                                        onChange={(e) => updateQuestionField(q.id, "question", e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Reading: Passage index picker */}
                                {testType === "reading" && (
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs">Target Passage</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full rounded-2xl text-sm font-semibold"
                                            value={q.passageIndex || 0}
                                            onChange={(e) => updateQuestionField(q.id, "passageIndex", parseInt(e.target.value))}
                                        >
                                            {(formData.passages || []).map((p, pIdx) => (
                                                <option key={pIdx} value={pIdx}>
                                                    Passage {pIdx + 1}: {p.title || "(Untitled)"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Type-specific extra inputs */}
                            <QuestionTypeExtras
                                q={q}
                                onUpdate={updateQuestionField}
                                onAddOption={handleAddOption}
                                onUpdateOption={updateOption}
                                onRemoveOption={handleRemoveOption}
                                onAddPair={handleAddPair}
                                onUpdatePair={updatePair}
                            />

                            {/* Correct answer */}
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Correct Answer</span></label>
                                {NEEDS_OPTIONS.includes(q.type) ? (
                                    <select
                                        className="select select-bordered w-full rounded-2xl border-success/30 bg-success/5 text-sm font-semibold"
                                        value={q.correctAnswer}
                                        onChange={(e) => updateQuestionField(q.id, "correctAnswer", e.target.value)}
                                        required
                                    >
                                        <option value="">— Select Correct Answer —</option>
                                        {(q.options && q.options.filter(opt => opt && opt.trim() !== "").length > 0
                                            ? q.options.filter(opt => opt && opt.trim() !== "")
                                            : q.type === "true-false"
                                                ? ["True", "False", "Not Given"]
                                                : q.type === "yes-no"
                                                    ? ["Yes", "No", "Not Given"]
                                                    : []
                                        ).map((opt, optIdx) => (
                                            <option key={optIdx} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        className="input input-bordered rounded-2xl border-success/30 bg-success/5"
                                        placeholder="Enter the exact correct answer"
                                        value={q.correctAnswer}
                                        onChange={(e) => updateQuestionField(q.id, "correctAnswer", e.target.value)}
                                        required
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
