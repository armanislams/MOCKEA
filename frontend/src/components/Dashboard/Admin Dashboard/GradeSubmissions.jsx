import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { 
    PiGraduationCap, 
    PiUser, 
    PiCalendar, 
    PiWarning,
    PiCheckCircle,
    PiPencilLine,
    PiMicrophoneStage,
    PiCaretRightBold,
    PiCheckBold
} from "react-icons/pi";

const GradeSubmissions = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedResult, setSelectedResult] = useState(null);
    const [scores, setScores] = useState({});

    const { data: results = [], isLoading } = useQuery({
        queryKey: ["all-mock-results"],
        queryFn: async () => {
            const res = await axiosSecure.get("/mock-tests/results/all");
            return res.data.results ?? [];
        }
    });

    const gradeMutation = useMutation({
        mutationFn: (data) => axiosSecure.patch("/mock-tests/grade-section", data),
        onSuccess: () => {
            toast.success("Section graded successfully");
            queryClient.invalidateQueries(["all-mock-results"]);
            setSelectedResult(null);
        }
    });

    const handleGradeSubmit = (resultId, sectionType) => {
        const score = scores[`${resultId}-${sectionType}`];
        if (!score) return toast.error("Please enter a score");
        gradeMutation.mutate({ resultId, sectionType, score: parseFloat(score) });
    };

    return (
        <div className="space-y-10">
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-black mb-2">Instructor Dashboard</p>
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                    <PiGraduationCap className="text-primary" />
                    Student Submissions
                </h1>
                <p className="text-base-content/60 mt-3 max-w-2xl text-lg leading-relaxed">
                    Review and grade Writing and Speaking sections for student mock tests. 
                    Reading and Listening are automatically graded.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-24 bg-base-300 animate-pulse rounded-3xl" />)
                ) : (
                    results.map((result) => (
                        <div key={result._id} className="card bg-white border border-base-300 shadow-sm overflow-hidden hover:shadow-md transition-all rounded-[2rem]">
                            <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="avatar placeholder">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-black text-xl">
                                            {result.userId?.name?.[0]}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-lg leading-none">{result.userId?.name}</h3>
                                        <p className="text-xs text-base-content/40 font-bold uppercase tracking-widest">{result.testId?.title}</p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-base-content/30 uppercase tracking-widest">
                                                <PiCalendar /> {new Date(result.createdAt).toLocaleDateString()}
                                            </span>
                                            {result.tabSwitchCount > 0 && (
                                                <span className="badge badge-error badge-xs font-black text-[9px] tracking-tighter uppercase px-2 py-2">
                                                    {result.tabSwitchCount} Violations
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {['writing', 'speaking'].map(type => {
                                        const section = result.sectionResults.find(s => s.sectionType === type);
                                        if (!section) return null;

                                        return (
                                            <div key={type} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                                section.isGraded ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20 border-dashed"
                                            }`}>
                                                <div className="text-2xl">
                                                    {type === 'writing' ? <PiPencilLine /> : <PiMicrophoneStage />}
                                                </div>
                                                <div className="flex flex-col min-w-[120px]">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{type}</span>
                                                    {section.isGraded ? (
                                                        <span className="text-lg font-black text-success">Score: {section.score}</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <input 
                                                                type="number" 
                                                                placeholder="Score"
                                                                step="0.5"
                                                                className="input input-bordered input-sm w-20 rounded-lg font-bold"
                                                                onChange={(e) => setScores(prev => ({
                                                                    ...prev,
                                                                    [`${result._id}-${type}`]: e.target.value
                                                                }))}
                                                            />
                                                            <button 
                                                                onClick={() => handleGradeSubmit(result._id, type)}
                                                                className="btn btn-primary btn-sm btn-square rounded-lg"
                                                            >
                                                                <PiCheckBold />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {section.isGraded && <PiCheckCircle className="text-success w-6 h-6" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-4 pl-6 border-l border-base-200 hidden xl:flex">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-base-content/30 uppercase tracking-widest leading-none mb-1">Status</p>
                                        <span className={`text-xs font-black uppercase tracking-widest ${
                                            result.sectionResults.every(s => s.isGraded) ? "text-success" : "text-warning animate-pulse"
                                        }`}>
                                            {result.sectionResults.every(s => s.isGraded) ? "Fully Graded" : "Pending Evaluation"}
                                        </span>
                                    </div>
                                    <PiCaretRightBold className="text-base-content/20" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GradeSubmissions;
