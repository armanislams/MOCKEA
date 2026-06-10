import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    PiBookOpen,
    PiEar,
    PiPencilLine,
    PiMicrophoneStage,
    PiPlusCircle,
    PiTrash,
    PiCloudArrowUp,
    PiPlus,
    PiCheckCircle,
    PiListBullets,
    PiTextT,
    PiArrowsLeftRight,
    PiMapTrifold,
} from "react-icons/pi";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { convertMarkdownContentToHtml } from "../../../utils/markdownUtils.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEST_SECTIONS = [
    { id: "reading",   label: "Reading",   icon: PiBookOpen,        color: "text-blue-500"   },
    { id: "listening", label: "Listening", icon: PiEar,             color: "text-purple-500" },
    { id: "writing",   label: "Writing",   icon: PiPencilLine,      color: "text-orange-500" },
    { id: "speaking",  label: "Speaking",  icon: PiMicrophoneStage, color: "text-green-500"  },
];

// Grouped question types for the dropdown
const QUESTION_TYPE_GROUPS = [
    {
        group: "Completion",
        icon: PiTextT,
        types: [
            { value: "short-answer",          label: "Short Answer / Note Completion" },
            { value: "sentence-completion",   label: "Sentence Completion" },
            { value: "summary-completion",    label: "Summary Completion" },
            { value: "table-completion",      label: "Table Completion" },
            { value: "flow-chart-completion", label: "Flow-chart Completion" },
        ],
    },
    {
        group: "Selection",
        icon: PiListBullets,
        types: [
            { value: "multiple-choice", label: "Multiple Choice (MCQ)" },
            { value: "true-false",      label: "True / False / Not Given" },
            { value: "yes-no",          label: "Yes / No / Not Given" },
        ],
    },
    {
        group: "Matching",
        icon: PiArrowsLeftRight,
        types: [
            { value: "matching",         label: "Matching" },
            { value: "heading-matching", label: "Heading Matching" },
        ],
    },
    {
        group: "Visual / Map (IELTS)",
        icon: PiMapTrifold,
        types: [
            { value: "map-labelling",     label: "Map / Plan Labelling" },
            { value: "diagram-labelling", label: "Diagram Labelling" },
        ],
    },
];


// Which types need options array
const NEEDS_OPTIONS = ["multiple-choice", "true-false", "yes-no"];
// Which types need matchingPairs
const NEEDS_PAIRS = ["matching", "heading-matching"];
// Which types need a per-question image URL
const NEEDS_IMAGE = ["map-labelling", "diagram-labelling"];

// IELTS Listening Part definitions
const LISTENING_PARTS = [
    { part: 1, label: "Part 1", context: "Social conversation (2 speakers)", hint: "Form / Note completion" },
    { part: 2, label: "Part 2", context: "Social monologue (1 speaker)",     hint: "MCQ / Matching / Map labelling" },
    { part: 3, label: "Part 3", context: "Academic discussion (2–4 speakers)", hint: "MCQ / Sentence completion" },
    { part: 4, label: "Part 4", context: "Academic lecture (1 speaker)",      hint: "Note / Summary / Table completion" },
];

// ─── Default question factory ─────────────────────────────────────────────────
const makeQuestion = () => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    type: "short-answer",
    question: "",
    correctAnswer: "",
    options: ["", ""],
    matchingPairs: [{ key: "", value: "" }],
    imageUrl: "",
    passageIndex: 0,
});

// ─── Initial form state ───────────────────────────────────────────────────────
const initialForm = () => ({
    title: "",
    instructions: "",
    passage: "",
    passages: [{ title: "", content: "" }],
    questionGroups: [{ title: "", instructions: "", fromQuestion: 1, toQuestion: 13, passageIndex: 0 }],
    audioUrl: "",
    speakingPrompt: "",
    speakingPart1Questions: [""],
    speakingPart3Questions: [""],
    images: [],
    task1Prompt: "",
    task1Image: "",
    task2Prompt: "",
    exampleQuestion: "Destination:",
    exampleAnswer: "Harbour City",
    examType: "IELTS",
    listeningPart: 1,
    forPlanType: "free",
    isPublic: false,
    isMockOnly: false,
    questions: [makeQuestion()],
});

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Grouped <select> for question type */
const QuestionTypeSelect = ({ value, onChange }) => (
    <select
        className="select select-bordered w-full rounded-2xl text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    >
        {QUESTION_TYPE_GROUPS.map((g) => (
            <optgroup key={g.group} label={`── ${g.group} ──`}>
                {g.types.map((t) => (
                    <option key={t.value} value={t.value}>
                        {t.label}
                    </option>
                ))}
            </optgroup>
        ))}
    </select>
);

/** Extra input fields that depend on question type */
const QuestionTypeExtras = ({ q, onUpdate, onAddOption, onUpdateOption, onAddPair, onUpdatePair }) => {
    if (NEEDS_OPTIONS.includes(q.type)) {
        return (
            <div className="bg-base-100 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/50">
                    Options
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                        <input
                            key={i}
                            type="text"
                            className="input input-bordered input-sm rounded-xl"
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            value={opt}
                            onChange={(e) => onUpdateOption(q.id, i, e.target.value)}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={() => onAddOption(q.id)}
                        className="btn btn-ghost btn-xs text-primary gap-1 self-center"
                    >
                        <PiPlus /> Add Option
                    </button>
                </div>
            </div>
        );
    }

    if (NEEDS_PAIRS.includes(q.type)) {
        return (
            <div className="bg-base-100 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/50">
                    Matching Pairs
                </span>
                {q.matchingPairs.map((pair, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            className="input input-bordered input-sm rounded-xl"
                            placeholder={`Item ${i + 1}`}
                            value={pair.key}
                            onChange={(e) => onUpdatePair(q.id, i, "key", e.target.value)}
                        />
                        <input
                            type="text"
                            className="input input-bordered input-sm rounded-xl"
                            placeholder={`Match ${i + 1}`}
                            value={pair.value}
                            onChange={(e) => onUpdatePair(q.id, i, "value", e.target.value)}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => onAddPair(q.id)}
                    className="btn btn-ghost btn-xs text-primary gap-1"
                >
                    <PiPlus /> Add Pair
                </button>
            </div>
        );
    }

    if (NEEDS_IMAGE.includes(q.type)) {
        return (
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-semibold text-xs">
                        Map / Diagram Image URL (for this question)
                    </span>
                </label>
                <input
                    type="url"
                    className="input input-bordered rounded-2xl text-sm"
                    placeholder="https://domain.com/map.png"
                    value={q.imageUrl || ""}
                    onChange={(e) => onUpdate(q.id, "imageUrl", e.target.value)}
                />
            </div>
        );
    }

    return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AddQuestionForm = () => {
    const axiosSecure = useAxiosSecure();
    const [testType, setTestType]   = useState("reading");
    const [formData, setFormData]   = useState(initialForm);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const patch = (updates) => setFormData((prev) => ({ ...prev, ...updates }));

    const patchQuestion = (id, updates) =>
        patch({
            questions: formData.questions.map((q) =>
                q.id === id ? { ...q, ...updates } : q
            ),
        });

    const handleAddQuestion = () =>
        patch({ questions: [...formData.questions, makeQuestion()] });

    const handleRemoveQuestion = (id) =>
        patch({ questions: formData.questions.filter((q) => q.id !== id) });

    const updateQuestion  = (id, field, value) => {
        // Auto-populate default options when type changes to true-false or yes-no
        if (field === "type") {
            let updates = { [field]: value };
            if (value === "true-false") {
                updates.options = ["True", "False", "Not Given"];
            } else if (value === "yes-no") {
                updates.options = ["Yes", "No", "Not Given"];
            }
            patchQuestion(id, updates);
        } else {
            patchQuestion(id, { [field]: value });
        }
    };

    const handleAddOption = (qId) =>
        patchQuestion(qId, {
            options: [
                ...formData.questions.find((q) => q.id === qId).options,
                "",
            ],
        });

    const updateOption = (qId, idx, value) => {
        const opts = [...formData.questions.find((q) => q.id === qId).options];
        opts[idx] = value;
        patchQuestion(qId, { options: opts });
    };

    const handleAddPair = (qId) => {
        const q = formData.questions.find((q) => q.id === qId);
        patchQuestion(qId, {
            matchingPairs: [...(q.matchingPairs || []), { key: "", value: "" }],
        });
    };

    const updatePair = (qId, idx, field, value) => {
        const q    = formData.questions.find((q) => q.id === qId);
        const pairs = q.matchingPairs.map((p, i) =>
            i === idx ? { ...p, [field]: value } : p
        );
        patchQuestion(qId, { matchingPairs: pairs });
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const mutation = useMutation({
        mutationFn: (data) => axiosSecure.post("/questions/add", data),
        onSuccess: () => {
            toast.success("Question set saved successfully!");
            setFormData(initialForm());
        },
        onError: (err) => toast.error(err.message || "Failed to save questions"),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, testType };

        if (testType === "reading") {
            const activePassages = (formData.passages || []).filter(p => p.title.trim() !== "" || p.content.trim() !== "" || (p.instructions && p.instructions.trim() !== ""));
            data.passages = activePassages;
            data.passage = activePassages.map((p, idx) => `
<section class="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 mb-8">
  <h2 class="text-3xl font-black text-primary mb-4">Reading Passage ${idx + 1}: ${p.title}</h2>
  <div class="space-y-4 text-slate-600">${convertMarkdownContentToHtml(p.content)}</div>
</section>
            `.trim()).join('\n\n');
        } else if (testType === "writing") {
            const task1HTML = `
<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
  <h3 class="text-xl font-bold text-slate-800 mb-2">Task 1: Academic Report (Recommended: 20 minutes, minimum 150 words)</h3>
  <p class="mb-4 text-slate-700 leading-relaxed font-medium">${formData.task1Prompt.replace(/\n/g, "<br/>")}</p>
</div>`.trim();
            const task2HTML = `
<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 mt-6">
  <h3 class="text-xl font-bold text-slate-800 mb-2">Task 2: Opinion Essay (Recommended: 40 minutes, minimum 250 words)</h3>
  <p class="mb-4 text-slate-700 leading-relaxed font-semibold">${formData.task2Prompt.replace(/\n/g, "<br/>")}</p>
</div>`.trim();
            data.passage  = `<div class="space-y-6">\n  ${task1HTML}\n\n  ${task2HTML}\n</div>`;
            data.images   = formData.task1Image ? [formData.task1Image] : [];
            data.questions = [
                { id: "w1", type: "short-answer", question: "Task Responses:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" },
            ];
            // Clear reading-specific passages — they have a required title field in the schema
            data.passages = [];
        } else if (testType === "speaking") {
            data.speakingPart1Questions = formData.speakingPart1Questions.filter(q => q.trim() !== "");
            data.speakingPart3Questions = formData.speakingPart3Questions.filter(q => q.trim() !== "");
            data.questions = [
                { id: "s1", type: "short-answer", question: "Speaking Recording Response:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" },
            ];
            // Clear reading-specific passages — they have a required title field in the schema
            data.passages = [];
        } else if (
            testType === "listening" &&
            (formData.examType === "IELTS" || formData.examType === "BOTH")
        ) {
            if (formData.listeningPart === 1) {
                // Compile example row + gapped notes into passage HTML
                const exampleHTML = `
<div class="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
  <div class="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Example</div>
  <div class="flex items-center justify-between text-sm font-semibold text-slate-700">
    <span>${formData.exampleQuestion || "Destination:"}</span>
    <span class="px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${formData.exampleAnswer || "Harbour City"}</span>
  </div>
</div>`.trim();
                data.passage = formData.passage.trim()
                    ? `${exampleHTML}\n\n<div class="ielts-listening-notes space-y-4">${formData.passage}</div>`
                    : exampleHTML;
            } else {
                data.passage = formData.passage.trim()
                    ? `<div class="ielts-listening-notes space-y-4">${formData.passage}</div>`
                    : "";
            }
            // Clear reading-specific passages — they have a required title field in the schema
            data.passages = [];
        } else if (testType === "listening") {
            // PTE listening (examType is PTE) — no passages needed
            data.passages = [];
        }

        // Strip frontend-only fields that are not part of the DB schema
        delete data.task1Prompt;
        delete data.task1Image;
        delete data.task2Prompt;
        delete data.exampleQuestion;
        delete data.exampleAnswer;

        if (data.images) {
            data.images = data.images.filter(img => img && img.trim() !== "");
        }

        mutation.mutate(data);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const isIeltsListening =
        testType === "listening" &&
        (formData.examType === "IELTS" || formData.examType === "BOTH");

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col gap-2 border-b border-base-300 pb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Admin Panel</p>
                <h1 className="text-3xl font-bold">Add New Question Set</h1>
                <p className="text-base-content/60">
                    Create a standardized question set for any section — IELTS or PTE Academic.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* ── Test Section Selector ──────────────────────────────── */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TEST_SECTIONS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTestType(item.id)}
                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${
                                testType === item.id
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-base-300 bg-white hover:border-primary/50"
                            }`}
                        >
                            <item.icon className={`w-8 h-8 ${testType === item.id ? "text-primary" : item.color}`} />
                            <span className="font-bold">{item.label}</span>
                        </button>
                    ))}
                </section>

                {/* ── General Info ───────────────────────────────────────── */}
                <div className="card bg-white border border-base-300 shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <PiPlusCircle className="text-primary" /> General Information
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 tracking-wide">Test Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none"
                                placeholder="e.g. Cambridge 18 – Test 1 – Part 1"
                                value={formData.title}
                                onChange={(e) => patch({ title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 tracking-wide">Exam Program</label>
                            <select
                                className="select select-bordered w-full rounded-2xl text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                value={formData.examType}
                                onChange={(e) => patch({ examType: e.target.value })}
                            >
                                <option value="IELTS">🎓 IELTS</option>
                                <option value="PTE">📘 PTE Academic</option>
                                <option value="BOTH">🌐 Both (IELTS &amp; PTE)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 tracking-wide">Plan Type</label>
                            <select
                                className="select select-bordered w-full rounded-2xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                value={formData.forPlanType}
                                onChange={(e) => patch({ forPlanType: e.target.value })}
                            >
                                <option value="free">Free</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 py-2">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary animate-none"
                                checked={formData.isPublic}
                                onChange={(e) => patch({ isPublic: e.target.checked })}
                            />
                            <span className="text-xs font-bold text-slate-700 tracking-wide">
                                Make available for guest (free-practice) users
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary animate-none"
                                checked={formData.isMockOnly}
                                onChange={(e) => patch({ isMockOnly: e.target.checked })}
                            />
                            <span className="text-xs font-bold text-slate-700 tracking-wide">
                                Mock Test Only (Hide from standard Practice Labs)
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 tracking-wide">Global Instructions</label>
                        <textarea
                            className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none resize-y min-h-[100px]"
                            placeholder="e.g. Complete the form. Write ONE WORD AND/OR A NUMBER for each answer."
                            value={formData.instructions}
                            onChange={(e) => patch({ instructions: e.target.value })}
                        />
                    </div>
                </div>

                {/* ── IELTS Listening: Part Selector ─────────────────────── */}
                {isIeltsListening && (
                    <div className="card bg-white border border-base-300 shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <PiEar className="text-primary" /> IELTS Listening Part
                        </h2>
                        <p className="text-sm text-base-content/60">
                            Each Part is a standalone 10-question set. The mock test bundler assembles Parts 1–4 into a full test.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {LISTENING_PARTS.map((p) => (
                                <button
                                    key={p.part}
                                    type="button"
                                    onClick={() => patch({ listeningPart: p.part })}
                                    className={`flex flex-col gap-1.5 p-4 rounded-2xl border-2 text-left transition-all ${
                                        formData.listeningPart === p.part
                                            ? "border-primary bg-primary/5"
                                            : "border-base-300 bg-white hover:border-primary/40"
                                    }`}
                                >
                                    <span className={`text-xs font-black uppercase tracking-widest ${
                                        formData.listeningPart === p.part ? "text-primary" : "text-base-content/40"
                                    }`}>
                                        {p.label}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 leading-snug">
                                        {p.context}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 mt-1">
                                        {p.hint}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Test Content ───────────────────────────────────────── */}
                <div className="card bg-white border border-base-300 shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <PiCloudArrowUp className="text-primary" /> Test Content
                    </h2>

                    {/* Reading Passages Manager */}
                    {testType === "reading" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Reading Passages ({formData.passages?.length || 0})</label>
                                <button
                                    type="button"
                                    onClick={() => patch({ passages: [...(formData.passages || []), { title: "", content: "" }] })}
                                    className="btn btn-primary btn-sm rounded-xl gap-1"
                                >
                                    <PiPlus /> Add Passage
                                </button>
                            </div>
                            <div className="space-y-4">
                                {(formData.passages || []).map((passage, pIdx) => (
                                    <div key={pIdx} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 relative">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">Passage {pIdx + 1}</span>
                                            {formData.passages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => patch({ passages: formData.passages.filter((_, idx) => idx !== pIdx) })}
                                                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg gap-1"
                                                >
                                                    <PiTrash /> Remove Passage
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">Passage Title</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all outline-none"
                                                placeholder={`e.g. Reading Passage ${pIdx + 1}: Electroreception`}
                                                value={passage.title}
                                                onChange={(e) => {
                                                    const updated = [...formData.passages];
                                                    updated[pIdx].title = e.target.value;
                                                    patch({ passages: updated });
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">Passage Content</label>
                                            <textarea
                                                className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all outline-none resize-y min-h-[150px] font-serif"
                                                placeholder="Paste passage paragraphs here..."
                                                value={passage.content}
                                                onChange={(e) => {
                                                    const updated = [...formData.passages];
                                                    updated[pIdx].content = e.target.value;
                                                    patch({ passages: updated });
                                                }}
                                                required
                                            />
                                            <p className="text-[11px] text-slate-500 font-semibold mt-1">
                                                Use markdown tables with vertical bars (<code>|</code>) and markdown links like <code>[example](https://example.com)</code>. Empty lines create paragraph breaks.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Question Groups Manager ──────────────────────────── */}
                    {testType === "reading" && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-xs font-black text-slate-700 tracking-wide uppercase">Question Groups</label>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Define ranges, headers & instructions shown above each block of questions.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => patch({ questionGroups: [...(formData.questionGroups || []), { title: "", instructions: "", fromQuestion: 1, toQuestion: 1, passageIndex: 0 }] })}
                                    className="btn btn-outline btn-primary btn-sm rounded-xl gap-1"
                                >
                                    <PiPlus /> Add Group
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(formData.questionGroups || []).map((group, gIdx) => (
                                    <div key={gIdx} className="p-5 bg-gradient-to-br from-primary/5 to-transparent border border-primary/15 rounded-3xl space-y-4 relative">
                                        {/* Delete */}
                                        {(formData.questionGroups || []).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => patch({ questionGroups: (formData.questionGroups || []).filter((_, i) => i !== gIdx) })}
                                                className="btn btn-ghost btn-xs btn-circle absolute top-3 right-3 text-error"
                                            >✕</button>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <PiBookOpen className="text-primary w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">Group {gIdx + 1}</span>
                                        </div>
                                        <div className="grid md:grid-cols-4 gap-3">
                                            {/* From Q# */}
                                            <div>
                                                <label className="label"><span className="label-text font-semibold text-xs">From Q#</span></label>
                                                <input
                                                    type="number" min={1}
                                                    className="input input-bordered w-full rounded-2xl text-sm"
                                                    value={group.fromQuestion || 1}
                                                    onChange={(e) => {
                                                        const upd = [...(formData.questionGroups || [])];
                                                        upd[gIdx] = { ...upd[gIdx], fromQuestion: parseInt(e.target.value) || 1 };
                                                        patch({ questionGroups: upd });
                                                    }}
                                                />
                                            </div>
                                            {/* To Q# */}
                                            <div>
                                                <label className="label"><span className="label-text font-semibold text-xs">To Q#</span></label>
                                                <input
                                                    type="number" min={1}
                                                    className="input input-bordered w-full rounded-2xl text-sm"
                                                    value={group.toQuestion || 1}
                                                    onChange={(e) => {
                                                        const upd = [...(formData.questionGroups || [])];
                                                        upd[gIdx] = { ...upd[gIdx], toQuestion: parseInt(e.target.value) || 1 };
                                                        patch({ questionGroups: upd });
                                                    }}
                                                />
                                            </div>
                                            {/* Target Passage */}
                                            <div>
                                                <label className="label"><span className="label-text font-semibold text-xs">Target Passage</span></label>
                                                <select
                                                    className="select select-bordered w-full rounded-2xl text-sm font-semibold"
                                                    value={group.passageIndex || 0}
                                                    onChange={(e) => {
                                                        const upd = [...(formData.questionGroups || [])];
                                                        upd[gIdx] = { ...upd[gIdx], passageIndex: parseInt(e.target.value) };
                                                        patch({ questionGroups: upd });
                                                    }}
                                                >
                                                    {(formData.passages || []).map((p, pIdx) => (
                                                        <option key={pIdx} value={pIdx}>
                                                            Passage {pIdx + 1}: {p.title || "(Untitled)"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Group Title */}
                                            <div>
                                                <label className="label"><span className="label-text font-semibold text-xs">Group Title (optional)</span></label>
                                                <input
                                                    type="text"
                                                    className="input input-bordered w-full rounded-2xl text-sm"
                                                    placeholder="e.g. True / False / Not Given"
                                                    value={group.title || ""}
                                                    onChange={(e) => {
                                                        const upd = [...(formData.questionGroups || [])];
                                                        upd[gIdx] = { ...upd[gIdx], title: e.target.value };
                                                        patch({ questionGroups: upd });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {/* Instructions */}
                                        <div>
                                            <label className="label"><span className="label-text font-semibold text-xs">Instructions for this group</span></label>
                                            <textarea
                                                className="textarea textarea-bordered w-full rounded-xl text-sm bg-white min-h-[3.5rem]"
                                                placeholder="e.g. Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN."
                                                value={group.instructions || ""}
                                                onChange={(e) => {
                                                    const upd = [...(formData.questionGroups || [])];
                                                    upd[gIdx] = { ...upd[gIdx], instructions: e.target.value };
                                                    patch({ questionGroups: upd });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Listening */}
                    {testType === "listening" && (
                        <div className="space-y-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 tracking-wide">Audio URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none"
                                    placeholder="Direct link to audio file (Dropbox, S3, Cloudinary…)"
                                    value={formData.audioUrl}
                                    onChange={(e) => patch({ audioUrl: e.target.value })}
                                    required
                                />
                            </div>

                            {/* IELTS/BOTH: Example box + Gapped Notes */}
                            {isIeltsListening && (
                                <div className="p-6 bg-indigo-50/40 border border-indigo-100 rounded-3xl space-y-5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                                        IELTS — Example &amp; Notes Context
                                    </h3>

                                    {/* Info box for Listening Part 3 / Part 4 */}
                                    {(formData.listeningPart === 3 || formData.listeningPart === 4) && (
                                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl space-y-4 shadow-sm animate-fadeSlideDown">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-2xl">
                                                    <PiBookOpen className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800">
                                                        How to Create IELTS Listening Part {formData.listeningPart} (Inline &amp; Table Completion)
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        Follow these steps to set up inline question gaps or markdown tables for the passage.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                                                        1
                                                    </div>
                                                    <h5 className="font-bold text-slate-700">Add Questions Below</h5>
                                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                                        Click <strong className="text-slate-700">+ Add Question</strong> below. Choose <strong className="text-slate-700">Short Answer / Note Completion</strong> as the type.
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                                                        2
                                                    </div>
                                                    <h5 className="font-bold text-slate-700">Insert Placeholders</h5>
                                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                                        In the text box below, write your passage. Mark input blanks with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px] text-blue-600 font-bold">___31___</code> matching the question number.
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                                                        3
                                                    </div>
                                                    <h5 className="font-bold text-slate-700">Add Tables (Markdown)</h5>
                                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                                        Admins can add tables by typing columns separated by <code>|</code> characters. The student UI renders them beautifully.
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                                                        4
                                                    </div>
                                                    <h5 className="font-bold text-slate-700">Inline Student View</h5>
                                                    <p className="text-slate-500 leading-relaxed text-[11px]">
                                                        The student UI automatically renders text boxes directly inside the passage text and table cells.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] space-y-2 overflow-x-auto border border-slate-800">
                                                <div className="text-slate-400 border-b border-slate-800 pb-1.5 font-sans font-bold flex justify-between items-center">
                                                    <span>💡 Quick Copy Markdown Table Template</span>
                                                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono font-normal">No coding needed!</span>
                                                </div>
                                                <div className="whitespace-pre">
{`| Column Header 1 | Column Header 2 | Column Header 3 |
|---|---|---|
| Present | Avoid pain | ___31___ |
| Future | Plan future | ___32___ |`}
                                                </div>
                                            </div>

                                            <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-50 text-[11px] text-blue-700 flex items-start gap-2">
                                                <span className="mt-0.5">ℹ️</span>
                                                <span className="leading-relaxed">
                                                    <strong>Important:</strong> Make sure the question numbers in your placeholders (e.g., <code>___31___</code>) match the order and numbering of the questions you add in the builder below.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {formData.listeningPart === 1 && (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-indigo-700 tracking-wide">
                                                    Example Question Label
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none"
                                                    placeholder="e.g. Destination:"
                                                    value={formData.exampleQuestion}
                                                    onChange={(e) => patch({ exampleQuestion: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-indigo-700 tracking-wide">
                                                    Example Answer (pre-filled for student)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none"
                                                    placeholder="e.g. Harbour City"
                                                    value={formData.exampleAnswer}
                                                    onChange={(e) => patch({ exampleAnswer: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-indigo-700 tracking-wide flex justify-between items-center">
                                            <span>Gapped Notes / Passage Context (Optional)</span>
                                            {(formData.listeningPart === 3 || formData.listeningPart === 4) && (
                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                                                    Part {formData.listeningPart} Inline Format Enabled
                                                </span>
                                            )}
                                        </label>
                                        <textarea
                                            className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none resize-y min-h-[140px] font-mono text-slate-800 leading-relaxed"
                                            placeholder={
                                                formData.listeningPart === 3
                                                    ? "Novel: (21) ___21___\nProtagonists: Mary Lennox; Colin Craven\nTime period: Early in (22) ___22___..."
                                                    : formData.listeningPart === 4
                                                    ? "| Column Header 1 | Column Header 2 |\n|---|---|\n| Avoid pain | ___31___ |\n| Plan future | ___32___ |"
                                                    : "Transport from Bayswater...\nThe passenger wants to travel to ___1___ on ___2___ of this month..."
                                            }
                                            value={formData.passage}
                                            onChange={(e) => patch({ passage: e.target.value })}
                                        />
                                        <p className="text-[11px] text-slate-500 font-semibold mt-1 flex flex-col gap-1">
                                            <span>💡 Use <code>___21___</code>, <code>___22___</code> etc. to mark answer gaps.</span>
                                            <span>📊 To create a table, use vertical bars (<code>|</code>) at the start and end of rows (see guide template above).</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Writing */}
                    {testType === "writing" && (
                        <div className="space-y-6">
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/60 space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Writing Task 1 — Academic Report
                                </h3>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-700 tracking-wide">Task 1 Prompt</label>
                                    <textarea
                                        className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none resize-y min-h-[140px]"
                                        placeholder="The table below shows global plastic production…"
                                        value={formData.task1Prompt}
                                        onChange={(e) => patch({ task1Prompt: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-700 tracking-wide">Task 1 Diagram Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-3.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none"
                                        placeholder="https://domain.com/chart.png"
                                        value={formData.task1Image}
                                        onChange={(e) => patch({ task1Image: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/60 space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Writing Task 2 — Opinion Essay
                                </h3>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-700 tracking-wide">Task 2 Prompt</label>
                                    <textarea
                                        className="w-full p-4 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-all duration-200 outline-none resize-y min-h-[140px]"
                                        placeholder="Some people argue that university education should be free…"
                                        value={formData.task2Prompt}
                                        onChange={(e) => patch({ task2Prompt: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Speaking */}
                    {testType === "speaking" && (
                        <div className="space-y-6">
                            {/* Part 1 */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                    <span>Part 1: Introduction & Interview Questions</span>
                                    <button
                                        type="button"
                                        onClick={() => patch({ speakingPart1Questions: [...formData.speakingPart1Questions, ""] })}
                                        className="btn btn-ghost btn-xs text-primary font-bold uppercase tracking-wider"
                                    >
                                        + Add Question
                                    </button>
                                </h3>
                                <div className="space-y-2">
                                    {formData.speakingPart1Questions.map((q, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl flex-1 text-sm h-11 bg-white"
                                                placeholder="e.g. Do you work or study?"
                                                value={q}
                                                onChange={(e) => {
                                                    const arr = [...formData.speakingPart1Questions];
                                                    arr[idx] = e.target.value;
                                                    patch({ speakingPart1Questions: arr });
                                                }}
                                            />
                                            {formData.speakingPart1Questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => patch({ speakingPart1Questions: formData.speakingPart1Questions.filter((_, i) => i !== idx) })}
                                                    className="btn btn-ghost btn-circle btn-sm text-error"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Part 2 Cue Card */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Part 2: Long Turn (Cue Card Prompt)
                                </h3>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-xs text-slate-600">Cue Card Topic Prompt</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered rounded-2xl h-28 text-sm bg-white font-medium"
                                        placeholder="Describe a historical building you have visited. You should say..."
                                        value={formData.speakingPrompt}
                                        onChange={(e) => patch({ speakingPrompt: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Part 3 Discussion */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                    <span>Part 3: Two-Way Analytical Discussion Questions</span>
                                    <button
                                        type="button"
                                        onClick={() => patch({ speakingPart3Questions: [...formData.speakingPart3Questions, ""] })}
                                        className="btn btn-ghost btn-xs text-primary font-bold uppercase tracking-wider"
                                    >
                                        + Add Question
                                    </button>
                                </h3>
                                <div className="space-y-2">
                                    {formData.speakingPart3Questions.map((q, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl flex-1 text-sm h-11 bg-white"
                                                placeholder="e.g. Why do people think protecting old buildings is important?"
                                                value={q}
                                                onChange={(e) => {
                                                    const arr = [...formData.speakingPart3Questions];
                                                    arr[idx] = e.target.value;
                                                    patch({ speakingPart3Questions: arr });
                                                }}
                                            />
                                            {formData.speakingPart3Questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => patch({ speakingPart3Questions: formData.speakingPart3Questions.filter((_, i) => i !== idx) })}
                                                    className="btn btn-ghost btn-circle btn-sm text-error"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Questions Builder ──────────────────────────────────── */}
                {testType !== "writing" && testType !== "speaking" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <PiPlusCircle className="text-primary" /> Questions
                                <span className="badge badge-primary badge-sm font-black">
                                    {formData.questions.length}
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

                        {formData.questions.map((q, index) => {
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
                                            className="btn btn-ghost btn-xs btn-circle absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                    onChange={(val) => updateQuestion(q.id, "type", val)}
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
                                                    onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
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
                                                        onChange={(e) => updateQuestion(q.id, "passageIndex", parseInt(e.target.value))}
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
                                            onUpdate={updateQuestion}
                                            onAddOption={handleAddOption}
                                            onUpdateOption={updateOption}
                                            onAddPair={handleAddPair}
                                            onUpdatePair={updatePair}
                                        />

                                        {/* Correct answer */}
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-semibold">Correct Answer</span></label>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl border-success/30 bg-success/5"
                                                placeholder="Enter the exact correct answer"
                                                value={q.correctAnswer}
                                                onChange={(e) => updateQuestion(q.id, "correctAnswer", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Submit ────────────────────────────────────────────── */}
                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg rounded-2xl px-12 gap-3 shadow-lg shadow-primary/20"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending
                            ? <span className="loading loading-spinner" />
                            : <PiCheckCircle className="w-6 h-6" />
                        }
                        Save Question Set
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddQuestionForm;
