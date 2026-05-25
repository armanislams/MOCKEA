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
    PiCheckCircle
} from "react-icons/pi";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const QUESTION_TYPES = [
    { value: "short-answer", label: "Short Answer" },
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "true-false", label: "True/False/Not Given" },
    { value: "yes-no", label: "Yes/No/Not Given" },
    { value: "matching", label: "Matching" },
    { value: "heading-matching", label: "Heading Matching" },
    { value: "sentence-completion", label: "Sentence Completion" },
    { value: "summary-completion", label: "Summary Completion" },
    { value: "diagram-labeling", label: "Diagram Labeling" },
];

const AddQuestionForm = () => {
    const axiosSecure = useAxiosSecure();
    const [testType, setTestType] = useState("reading");
    const [formData, setFormData] = useState(() => ({
        title: "",
        instructions: "",
        passage: "",
        audioUrl: "",
        speakingPrompt: "",
        images: [""],
        task1Prompt: "",
        task1Image: "",
        task2Prompt: "",
        exampleQuestion: "Destination:",
        exampleAnswer: "Harbour City",
        examType: "IELTS",
        forPlanType: "free",
        isPublic: false,
        questions: [
            { id: Date.now().toString(), type: "short-answer", question: "", correctAnswer: "", options: [""] }
        ]
    }));

    const mutation = useMutation({
        mutationFn: (data) => axiosSecure.post("/questions/add", data),
        onSuccess: () => {
            toast.success("Question set added successfully!");
            // Reset form or redirect
        },
        onError: (err) => toast.error(err.message || "Failed to add questions")
    });

    const handleAddQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { id: Date.now().toString(), type: "short-answer", question: "", correctAnswer: "", options: [""] }]
        });
    };

    const handleRemoveQuestion = (id) => {
        setFormData({
            ...formData,
            questions: formData.questions.filter(q => q.id !== id)
        });
    };

    const updateQuestion = (id, field, value) => {
        setFormData({
            ...formData,
            questions: formData.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
        });
    };

    const handleAddOption = (qId) => {
        setFormData({
            ...formData,
            questions: formData.questions.map(q => q.id === qId ? { ...q, options: [...q.options, ""] } : q)
        });
    };

    const updateOption = (qId, optIdx, value) => {
        setFormData({
            ...formData,
            questions: formData.questions.map(q => {
                if (q.id === qId) {
                    const newOpts = [...q.options];
                    newOpts[optIdx] = value;
                    return { ...q, options: newOpts };
                }
                return q;
            })
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let submissionData = { ...formData, testType };

        if (testType === "writing") {
            // Standard IELTS Academic Task 1 & Task 2 HTML formatting
            const task1HTML = `
  <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
    <h3 class="text-xl font-bold text-slate-800 mb-2">Task 1: Academic Report (Recommended: 20 minutes, minimum 150 words)</h3>
    <p class="mb-4 text-slate-700 leading-relaxed font-medium">${formData.task1Prompt.replace(/\n/g, "<br/>")}</p>
  </div>
            `.trim();

            const task2HTML = `
  <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 mt-6">
    <h3 class="text-xl font-bold text-slate-800 mb-2">Task 2: Opinion Essay (Recommended: 40 minutes, minimum 250 words)</h3>
    <p class="mb-4 text-slate-700 leading-relaxed font-semibold">${formData.task2Prompt.replace(/\n/g, "<br/>")}</p>
  </div>
            `.trim();

            submissionData.passage = `<div class="space-y-6">\n  ${task1HTML}\n\n  ${task2HTML}\n</div>`;
            
            // Build Diagram Images array
            const images = [];
            if (formData.task1Image) {
                images.push(formData.task1Image);
            }
            submissionData.images = images;
            
            // Auto-inject default subjective grading question
            submissionData.questions = [
                { id: "w1", type: "short-answer", question: "Task Responses:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" }
            ];
        } else if (testType === "speaking") {
            // Auto-inject default subjective grading question
            submissionData.questions = [
                { id: "s1", type: "short-answer", question: "Speaking Recording Response:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" }
            ];
        } else if (testType === "listening" && (formData.examType === "IELTS" || formData.examType === "BOTH")) {
            // Compile Example & Gapped Notes into passage
            const exampleHTML = `
  <div class="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
    <div class="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Example</div>
    <div class="flex items-center justify-between text-sm font-semibold text-slate-700">
      <span>${formData.exampleQuestion || "Destination:"}</span>
      <span class="px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${formData.exampleAnswer || "Harbour City"}</span>
    </div>
  </div>
            `.trim();

            submissionData.passage = `${exampleHTML}\n\n<div class="ielts-listening-notes space-y-4">${formData.passage}</div>`;
        }

        mutation.mutate(submissionData);
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col gap-2 border-b border-base-300 pb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Admin Panel</p>
                <h1 className="text-3xl font-bold">Add New IELTS Questions</h1>
                <p className="text-base-content/60">Create a new set of questions for Reading, Listening, Writing, or Speaking.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section Selector */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: "reading", label: "Reading", icon: PiBookOpen, color: "text-blue-500" },
                        { id: "listening", label: "Listening", icon: PiEar, color: "text-purple-500" },
                        { id: "writing", label: "Writing", icon: PiPencilLine, color: "text-orange-500" },
                        { id: "speaking", label: "Speaking", icon: PiMicrophoneStage, color: "text-green-500" },
                    ].map((item) => (
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

                {/* General Info */}
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
                                placeholder="e.g. Cambridge 18 - Test 1 - Passage 1"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Exam Program</span></label>
                            <select 
                                className="select select-bordered rounded-2xl font-bold"
                                value={formData.examType}
                                onChange={(e) => setFormData({...formData, examType: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, forPlanType: e.target.value})}
                            >
                                <option value="free">Free</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>
                    {/* isPublic toggle */}
                    <div className="form-control mt-2">
                        <label className="label cursor-pointer gap-3 justify-start">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={formData.isPublic}
                                onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                            />
                            <span className="label-text font-semibold">Make available for guest (free-practice) users</span>
                        </label>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Global Instructions</span></label>
                        <textarea 
                            className="textarea textarea-bordered rounded-2xl h-24" 
                            placeholder="e.g. Read the passage and answer questions 1-13..."
                            value={formData.instructions}
                            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        />
                    </div>
                </div>

                {/* Content Specifics */}
                <div className="card bg-white border border-base-300 shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <PiCloudArrowUp className="text-primary" /> Test Content
                    </h2>
                    
                    {testType === 'reading' && (
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Reading Passage</span></label>
                            <textarea 
                                className="textarea textarea-bordered rounded-2xl h-64 font-serif" 
                                placeholder="Paste the reading passage here..."
                                value={formData.passage}
                                onChange={(e) => setFormData({...formData, passage: e.target.value})}
                                required
                            />
                        </div>
                    )}

                    {testType === 'listening' && (
                        <div className="space-y-5">
                            {/* Audio URL — always required */}
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Audio URL</span></label>
                                <input 
                                    type="url" 
                                    className="input input-bordered rounded-2xl" 
                                    placeholder="Link to the audio file (Dropbox, S3, etc.)"
                                    value={formData.audioUrl}
                                    onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                                    required
                                />
                            </div>

                            {/* IELTS / BOTH: British Council Note Completion Inputs */}
                            {(formData.examType === 'IELTS' || formData.examType === 'BOTH') && (
                                <div className="p-6 bg-indigo-50/40 border border-indigo-100 rounded-3xl space-y-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm">
                                            <PiEar />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">IELTS Format — Note/Form Completion</h3>
                                    </div>

                                    {/* Example Row (pre-filled for candidates) */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-semibold text-xs text-indigo-700">Example Question Label</span></label>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl text-sm"
                                                placeholder="e.g. Destination:"
                                                value={formData.exampleQuestion}
                                                onChange={(e) => setFormData({...formData, exampleQuestion: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-semibold text-xs text-indigo-700">Example Answer (pre-filled for student)</span></label>
                                            <input
                                                type="text"
                                                className="input input-bordered rounded-2xl text-sm"
                                                placeholder="e.g. Harbour City"
                                                value={formData.exampleAnswer}
                                                onChange={(e) => setFormData({...formData, exampleAnswer: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Gapped Passage / Notes context text */}
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-semibold text-xs text-indigo-700">Gapped Notes / Passage Context (Optional)</span></label>
                                        <textarea
                                            className="textarea textarea-bordered rounded-2xl h-28 text-sm font-serif"
                                            placeholder="e.g. Transport from Bayswater&#10;The passenger wants to travel to ___1___ on ___2___ of this month..."
                                            value={formData.passage}
                                            onChange={(e) => setFormData({...formData, passage: e.target.value})}
                                        />
                                        <p className="text-[10px] text-slate-400 font-semibold mt-1">Use ___1___ ___2___ etc. to indicate where the answer gaps are in context text.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {testType === 'writing' && (
                        <div className="w-full space-y-6">
                            {/* Task 1 details */}
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Writing Task 1 (Academic Report)</h3>
                                
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold text-xs text-slate-600">Task 1 Prompt / Instructions</span></label>
                                    <textarea 
                                        className="textarea textarea-bordered rounded-2xl h-28 text-sm" 
                                        placeholder="e.g. The table below details global plastic production (in millions of tonnes) and the percentage of plastic recycled in four regions..."
                                        value={formData.task1Prompt}
                                        onChange={(e) => setFormData({...formData, task1Prompt: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold text-xs text-slate-600">Task 1 Diagram Image URL (Optional)</span></label>
                                    <input 
                                        type="url" 
                                        className="input input-bordered rounded-2xl text-sm" 
                                        placeholder="e.g. https://domain.com/chart-diagram.png"
                                        value={formData.task1Image}
                                        onChange={(e) => setFormData({...formData, task1Image: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Task 2 details */}
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/60 space-y-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Writing Task 2 (Opinion Essay)</h3>
                                
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold text-xs text-slate-600">Task 2 Prompt / Topic</span></label>
                                    <textarea 
                                        className="textarea textarea-bordered rounded-2xl h-28 text-sm" 
                                        placeholder="e.g. Some people argue that university education should be completely free for all students, while others believe..."
                                        value={formData.task2Prompt}
                                        onChange={(e) => setFormData({...formData, task2Prompt: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {testType === 'speaking' && (
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Speaking Topic / Prompt</span></label>
                            <textarea
                                className="textarea textarea-bordered rounded-2xl h-32"
                                placeholder="e.g. Describe a place you have visited recently. You should say: where it is, when you went there, what you did there, and explain why you liked it."
                                value={formData.speakingPrompt}
                                onChange={e => setFormData({ ...formData, speakingPrompt: e.target.value })}
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Questions Builder */}
                {testType !== 'writing' && testType !== 'speaking' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <PiPlusCircle className="text-primary" /> Questions
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
                            <div key={q.id} className="card bg-white border border-base-300 shadow-sm p-6 space-y-4 relative group">
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveQuestion(q.id)}
                                    className="btn btn-ghost btn-xs btn-circle absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <PiTrash className="w-4 h-4" />
                                </button>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="label"><span className="label-text font-semibold">Question {index + 1} Type</span></label>
                                        <select 
                                            className="select select-bordered w-full rounded-2xl"
                                            value={q.type}
                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                        >
                                            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label"><span className="label-text font-semibold">Question Text</span></label>
                                        <input 
                                            type="text" 
                                            className="input input-bordered w-full rounded-2xl" 
                                            placeholder="e.g. What is the main cause of..."
                                            value={q.question}
                                            onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Options for Multiple Choice */}
                                {(q.type === 'multiple-choice' || q.type === 'matching' || q.type === 'heading-matching') && (
                                    <div className="bg-base-100 p-4 rounded-2xl space-y-3">
                                        <label className="label p-0"><span className="label-text font-semibold text-xs uppercase tracking-wider">Options</span></label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {q.options.map((opt, optIdx) => (
                                                <input 
                                                    key={optIdx}
                                                    type="text" 
                                                    className="input input-bordered input-sm rounded-xl" 
                                                    placeholder={`Option ${optIdx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                />
                                            ))}
                                            <button 
                                                type="button" 
                                                onClick={() => handleAddOption(q.id)}
                                                className="btn btn-ghost btn-xs text-primary gap-1 self-center"
                                            >
                                                <PiPlus /> Add Option
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Correct Answer</span></label>
                                    <input 
                                        type="text" 
                                        className="input input-bordered rounded-2xl border-success/30 bg-success/5" 
                                        placeholder="Enter the correct answer exactly"
                                        value={q.correctAnswer}
                                        onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-8">
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg rounded-2xl px-12 gap-3 shadow-lg shadow-primary/20"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <span className="loading loading-spinner" /> : <PiCheckCircle className="w-6 h-6" />}
                        Save Question Set
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddQuestionForm;
