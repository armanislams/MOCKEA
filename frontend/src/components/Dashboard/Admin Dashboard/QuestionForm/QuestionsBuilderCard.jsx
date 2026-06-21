import { 
    PiPlusCircle, 
    PiPlus, 
    PiBookOpen, 
    PiTrash 
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
    handleAddPair,
    updatePair,
}) {
    if (testType === "writing" || testType === "speaking") return null;

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

            {formData.questions?.map((q, index) => {
                const questionNum = index + 1;
                const group = testType === "reading"
                    ? (formData.questionGroups || []).find(g => g.fromQuestion === questionNum)
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
