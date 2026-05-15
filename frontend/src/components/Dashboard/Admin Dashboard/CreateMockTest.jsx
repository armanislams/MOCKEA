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
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const CreateMockTest = () => {
    const axiosSecure = useAxiosSecure();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        planType: "free",
        totalDuration: 165,
        sections: {
            reading: [],
            listening: [],
            writing: [],
            speaking: []
        }
    });

    const { data: questions = [], isLoading } = useQuery({
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

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Admin Panel</p>
                <h1 className="text-3xl font-bold flex items-center gap-2"><PiFiles className="text-primary" /> Create Full Mock Test</h1>
                <p className="text-base-content/60">Bundle multiple question sets into a complete IELTS mock exam.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="card bg-white border border-base-300 shadow-sm p-6 grid md:grid-cols-2 gap-6">
                    <div className="form-control">
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
                </div>

                {/* Section Bundler */}
                <div className="space-y-6">
                    {['reading', 'listening', 'writing', 'speaking'].map((type) => (
                        <div key={type} className="space-y-3">
                            <h3 className="text-lg font-bold flex items-center gap-2 capitalize">
                                <span className="p-2 rounded-xl bg-base-200">{sectionIcons[type]}</span>
                                Select {type} Content
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {questions.filter(q => q.testType === type).map((q) => (
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
                                            <span className="font-semibold text-sm line-clamp-1">{q.title}</span>
                                            {formData.sections[type].includes(q._id) && <PiCheckCircle className="text-primary" />}
                                        </div>
                                        <p className="text-[10px] text-base-content/50 mt-1">{q.questions?.length || 0} Questions</p>
                                    </div>
                                ))}
                                {questions.filter(q => q.testType === type).length === 0 && (
                                    <div className="col-span-full py-4 text-center text-sm text-base-content/40 border-2 border-dashed border-base-300 rounded-2xl">
                                        No {type} questions available. Add some first!
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
