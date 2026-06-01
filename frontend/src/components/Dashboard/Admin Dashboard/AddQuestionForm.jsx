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

// Flat list for utility lookups
const ALL_QUESTION_TYPES = QUESTION_TYPE_GROUPS.flatMap((g) => g.types);

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
});

// ─── Initial form state ───────────────────────────────────────────────────────
const initialForm = () => ({
    title: "",
    instructions: "",
    passage: "",
    audioUrl: "",
    speakingPrompt: "",
    speakingPart1Questions: [""],
    speakingPart3Questions: [""],
    images: [""],
    task1Prompt: "",
    task1Image: "",
    task2Prompt: "",
    exampleQuestion: "Destination:",
    exampleAnswer: "Harbour City",
    examType: "IELTS",
    listeningPart: 1,
    forPlanType: "free",
    isPublic: false,
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

    const updateQuestion  = (id, field, value) => patchQuestion(id, { [field]: value });

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

        if (testType === "writing") {
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
        } else if (testType === "speaking") {
            data.speakingPart1Questions = formData.speakingPart1Questions.filter(q => q.trim() !== "");
            data.speakingPart3Questions = formData.speakingPart3Questions.filter(q => q.trim() !== "");
            data.questions = [
                { id: "s1", type: "short-answer", question: "Speaking Recording Response:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" },
            ];
        } else if (
            testType === "listening" &&
            (formData.examType === "IELTS" || formData.examType === "BOTH")
        ) {
            // Compile example row + gapped notes into passage HTML
            const exampleHTML = `
<div class="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
  <div class="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Example</div>
  <div class="flex items-center justify-between text-sm font-semibold text-slate-700">
    <span>${formData.exampleQuestion || "Destination:"}</span>
    <span class="px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${formData.exampleAnswer || "Harbour City"}</span>
  </div>
</div>`.trim();
            data.passage = `${exampleHTML}\n\n<div class="ielts-listening-notes space-y-4">${formData.passage}</div>`;
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
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="form-control md:col-span-1">
                            <label className="label"><span className="label-text font-semibold">Test Title</span></label>
                            <input
                                type="text"
                                className="input input-bordered rounded-2xl"
                                placeholder="e.g. Cambridge 18 – Test 1 – Part 1"
                                value={formData.title}
                                onChange={(e) => patch({ title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Exam Program</span></label>
                            <select
                                className="select select-bordered rounded-2xl font-bold"
                                value={formData.examType}
                                onChange={(e) => patch({ examType: e.target.value })}
                            >
                                <option value="IELTS">🎓 IELTS</option>
                                <option value="PTE">📘 PTE Academic</option>
                                <option value="BOTH">🌐 Both (IELTS &amp; PTE)</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Plan Type</span></label>
                            <select
                                className="select select-bordered rounded-2xl"
                                value={formData.forPlanType}
                                onChange={(e) => patch({ forPlanType: e.target.value })}
                            >
                                <option value="free">Free</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label cursor-pointer gap-3 justify-start">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={formData.isPublic}
                                onChange={(e) => patch({ isPublic: e.target.checked })}
                            />
                            <span className="label-text font-semibold">
                                Make available for guest (free-practice) users
                            </span>
                        </label>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Global Instructions</span></label>
                        <textarea
                            className="textarea textarea-bordered rounded-2xl h-20"
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

                    {/* Reading */}
                    {testType === "reading" && (
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Reading Passage</span></label>
                            <textarea
                                className="textarea textarea-bordered rounded-2xl h-64 font-serif"
                                placeholder="Paste the full reading passage here..."
                                value={formData.passage}
                                onChange={(e) => patch({ passage: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {/* Listening */}
                    {testType === "listening" && (
                        <div className="space-y-5">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Audio URL</span></label>
                                <input
                                    type="url"
                                    className="input input-bordered rounded-2xl"
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
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold text-xs text-indigo-700">
                                                    Example Question Label
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl text-sm"
                                                placeholder="e.g. Destination:"
                                                value={formData.exampleQuestion}
                                                onChange={(e) => patch({ exampleQuestion: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold text-xs text-indigo-700">
                                                    Example Answer (pre-filled for student)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl text-sm"
                                                placeholder="e.g. Harbour City"
                                                value={formData.exampleAnswer}
                                                onChange={(e) => patch({ exampleAnswer: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-xs text-indigo-700">
                                                Gapped Notes / Passage Context (Optional)
                                            </span>
                                        </label>
                                        <textarea
                                            className="textarea textarea-bordered rounded-2xl h-28 text-sm font-serif"
                                            placeholder={"Transport from Bayswater\nThe passenger wants to travel to ___1___ on ___2___ of this month..."}
                                            value={formData.passage}
                                            onChange={(e) => patch({ passage: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                            Use ___1___ ___2___ etc. to mark answer gaps in the context text.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Writing */}
                    {testType === "writing" && (
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Writing Task 1 — Academic Report
                                </h3>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold text-xs">Task 1 Prompt</span></label>
                                    <textarea
                                        className="textarea textarea-bordered rounded-2xl h-28 text-sm"
                                        placeholder="The table below shows global plastic production…"
                                        value={formData.task1Prompt}
                                        onChange={(e) => patch({ task1Prompt: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold text-xs">Task 1 Diagram Image URL (Optional)</span></label>
                                    <input
                                        type="url"
                                        className="input input-bordered rounded-2xl text-sm"
                                        placeholder="https://domain.com/chart.png"
                                        value={formData.task1Image}
                                        onChange={(e) => patch({ task1Image: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Writing Task 2 — Opinion Essay
                                </h3>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold text-xs">Task 2 Prompt</span></label>
                                    <textarea
                                        className="textarea textarea-bordered rounded-2xl h-28 text-sm"
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

                        {formData.questions.map((q, index) => (
                            <div
                                key={q.id}
                                className="card bg-white border border-base-300 shadow-sm p-6 space-y-4 relative group"
                            >
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
                                        <label className="label"><span className="label-text font-semibold">Type</span></label>
                                        <QuestionTypeSelect
                                            value={q.type}
                                            onChange={(val) => updateQuestion(q.id, "type", val)}
                                        />
                                    </div>
                                    {/* Question text */}
                                    <div className="md:col-span-2">
                                        <label className="label"><span className="label-text font-semibold">Question / Label</span></label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full rounded-2xl"
                                            placeholder="e.g. Name of the hotel:"
                                            value={q.question}
                                            onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                                            required
                                        />
                                    </div>
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
                        ))}
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
