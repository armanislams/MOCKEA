import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { 
    PiFiles, 
    PiBookOpen, 
    PiEar, 
    PiPencilLine, 
    PiMicrophoneStage,
    PiPlus,
    PiCheckCircle
} from "react-icons/pi";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const EXAM_COLORS = {
    IELTS: "badge-primary",
    PTE: "badge-success",
    BOTH: "badge-warning",
};

const CreateMockTest = () => {
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        planType: "free",
        examType: "IELTS",
        isPublic: false,
        totalDuration: 165,
        sections: {
            reading: [],
            listening: [],
            writing: [],
            speaking: []
        }
    });

    const { data: questions = [] } = useQuery({
        queryKey: ["admin-questions-for-bundle"],
        queryFn: async () => {
            const res = await axiosSecure.get("/questions");
            return res.data.questions ?? [];
        }
    });

    const mutation = useMutation({
        mutationFn: (data) => axiosSecure.post("/mock-tests/create", data),
        onSuccess: () => {
            toast.success("Mock Test created successfully!");
            navigate("/dashboard/admin/manage-mock-tests");
        }
    });

    const toggleQuestion = (type, id) => {
        const current = formData.sections[type];
        const exists = current.includes(id);
        
        setFormData({
            ...formData,
            sections: {
                ...formData.sections,
                [type]: exists ? current.filter(qId => qId !== id) : [...current, id]
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const sectionIcons = {
        reading: <PiBookOpen />,
        listening: <PiEar />,
        writing: <PiPencilLine />,
        speaking: <PiMicrophoneStage />
    };

    // Filter questions matching the selected examType (includes BOTH)
    const filteredQuestions = (type) => {
        return questions.filter(q => {
            if (q.testType !== type) return false;
            if (formData.examType === "BOTH") return true;
            return (q.examType === formData.examType || q.examType === "BOTH");
        });
    };

    const handleShowTitleIfClipped = (e, title) => {
        const el = e.currentTarget;
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
            el.setAttribute("title", title);
        } else {
            el.removeAttribute("title");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Admin Panel</p>
                <h1 className="text-3xl font-bold flex items-center gap-2"><PiFiles className="text-primary" /> Create Full Mock Test</h1>
                <p className="text-base-content/60">Bundle multiple question sets into a complete mock exam. Questions are filtered by exam program.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="card bg-white border border-base-300 shadow-sm p-6 grid md:grid-cols-3 gap-6">
                    <div className="form-control md:col-span-1">
                        <label className="label"><span className="label-text font-bold">Test Title</span></label>
                        <input 
                            type="text" 
                            className="input input-bordered rounded-2xl" 
                            placeholder="e.g. Full Mock Test #1"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Exam Program</span></label>
                        <select 
                            className="select select-bordered rounded-2xl font-bold"
                            value={formData.examType}
                            onChange={(e) => {
                                // Reset sections when exam type changes to prevent mis-bundling
                                setFormData({
                                    ...formData,
                                    examType: e.target.value,
                                    sections: { reading: [], listening: [], writing: [], speaking: [] }
                                });
                            }}
                        >
                            <option value="IELTS">🎓 IELTS</option>
                            <option value="PTE">📘 PTE Academic</option>
                            <option value="BOTH">🌐 Both (IELTS &amp; PTE)</option>
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Plan Type</span></label>
                        <select 
                            className="select select-bordered rounded-2xl"
                            value={formData.planType}
                            onChange={(e) => setFormData({...formData, planType: e.target.value})}
                        >
                            <option value="free">Free</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <div className="form-control md:col-span-2">
                        <label className="label"><span className="label-text font-bold">Total Duration (Minutes)</span></label>
                        <input 
                            type="number" 
                            className="input input-bordered rounded-2xl" 
                            value={formData.totalDuration}
                            onChange={(e) => setFormData({...formData, totalDuration: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="form-control flex flex-col justify-end">
                        <label className="label cursor-pointer gap-3 justify-start">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={formData.isPublic}
                                onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                            />
                            <span className="label-text font-semibold">Public (guest practice)</span>
                        </label>
                    </div>
                </div>

                {/* Exam type info banner */}
                <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold ${
                    formData.examType === 'IELTS' ? 'bg-primary/5 border-primary/20 text-primary' :
                    formData.examType === 'PTE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                    <span className="text-xl">{formData.examType === 'IELTS' ? '🎓' : formData.examType === 'PTE' ? '📘' : '🌐'}</span>
                    Showing questions for: <strong>{formData.examType === 'BOTH' ? 'All Exams (IELTS + PTE)' : formData.examType}</strong>. Switching exam type clears your selection.
                </div>

                {/* Section Bundler */}
                <div className="space-y-6">
                    {['reading', 'listening', 'writing', 'speaking'].map((type) => {
                        const sectionQs = filteredQuestions(type);
                        return (
                            <div key={type} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold flex items-center gap-2 capitalize">
                                        <span className="p-2 rounded-xl bg-base-200">{sectionIcons[type]}</span>
                                        Select {type} Content
                                    </h3>
                                    {formData.sections[type].length > 0 && (
                                        <span className="badge badge-primary badge-sm px-3 py-2 font-black">
                                            {formData.sections[type].length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {sectionQs.map((q) => (
                                        <div 
                                            key={q._id}
                                            onClick={() => toggleQuestion(type, q._id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                formData.sections[type].includes(q._id)
                                                ? "border-primary bg-primary/5 shadow-inner"
                                                : "border-base-300 bg-white hover:border-primary/40"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span 
                                                    className="font-semibold text-sm line-clamp-1 flex-1 pr-2"
                                                    onMouseEnter={(e) => handleShowTitleIfClipped(e, q.title)}
                                                >
                                                    {q.title}
                                                </span>
                                                {formData.sections[type].includes(q._id) && <PiCheckCircle className="text-primary flex-shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <p className="text-[10px] text-base-content/50">{q.questions?.length || 0} Questions</p>
                                                <span className={`badge badge-xs font-black ${EXAM_COLORS[q.examType] || 'badge-ghost'}`}>{q.examType}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {sectionQs.length === 0 && (
                                        <div className="col-span-full py-8 text-center text-sm text-base-content/40 border-2 border-dashed border-base-300 rounded-2xl">
                                            No {type} questions for <strong>{formData.examType}</strong>. Add some from the Question Manager first!
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-8">
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg rounded-2xl px-12 gap-3 shadow-lg shadow-primary/20"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <span className="loading loading-spinner" /> : <PiPlus className="w-6 h-6" />}
                        Create Mock Test
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateMockTest;
