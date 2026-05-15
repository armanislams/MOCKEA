import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { 
    PiArrowLeftBold, 
    PiCheckCircleFill, 
    PiXCircleFill, 
    PiInfoFill,
    PiClockFill,
    PiBookOpenFill,
    PiEarFill,
    PiPencilLineFill,
    PiMicrophoneStageFill
} from "react-icons/pi";

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [activeTab, setActiveTab] = useState("reading");

    const { data: result, isLoading } = useQuery({
        queryKey: ["mock-result-detail", id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/mock-tests/results/${id}`);
            return res.data.result;
        }
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen"><span className="loading loading-spinner loading-lg text-primary" /></div>;
    if (!result) return <div className="p-10 text-center">Result not found.</div>;

    const currentSectionResult = result.sectionResults.find(s => s.sectionType === activeTab);
    const currentSectionData = result.testId?.sections?.[activeTab]?.[0];

    return (
        <div className="min-h-screen bg-base-200 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-base-300 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
                            <PiArrowLeftBold className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">{result.testId?.title}</h1>
                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Performance Review • {new Date(result.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {['reading', 'listening', 'writing', 'speaking'].map((type) => (
                            <button 
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`btn btn-sm rounded-xl px-4 font-black uppercase tracking-tighter ${
                                    activeTab === type ? "btn-primary" : "btn-ghost text-base-content/40"
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-10">
                {!currentSectionResult ? (
                    <div className="card bg-white p-20 text-center space-y-4 rounded-[3rem] border border-base-300 shadow-sm">
                        <PiInfoFill className="text-5xl text-base-content/10 mx-auto" />
                        <h2 className="text-2xl font-black opacity-30">Section Not Attempted</h2>
                        <p className="text-base-content/40">You didn't complete this section during the test.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Summary Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card bg-white p-8 rounded-[2.5rem] border border-base-300 shadow-sm flex flex-row items-center gap-6">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl ${
                                    currentSectionResult.isGraded ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                }`}>
                                    {currentSectionResult.isGraded ? <PiCheckCircleFill /> : <PiClockFill />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Band Score / Raw</p>
                                    <p className="text-3xl font-black tracking-tighter">
                                        {currentSectionResult.isGraded ? currentSectionResult.score : "Pending"}
                                    </p>
                                </div>
                            </div>

                            <div className="card bg-white p-8 rounded-[2.5rem] border border-base-300 shadow-sm flex flex-row items-center gap-6 md:col-span-2">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl">
                                    <PiInfoFill />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Instructor Comments</p>
                                    <p className="text-base-content/60 italic">
                                        {currentSectionResult.isGraded 
                                            ? "Well done! Focus on identifying distractors in multiple-choice questions." 
                                            : "This section is currently under review by our senior instructors."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Review Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left: Passage / Content */}
                            <div className="card bg-white p-10 rounded-[3rem] border border-base-300 shadow-sm sticky top-28 h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                                {activeTab === 'reading' && (
                                    <div className="prose prose-slate max-w-none">
                                        <h2 className="text-3xl font-black tracking-tight mb-6">{currentSectionData?.title}</h2>
                                        <div dangerouslySetInnerHTML={{ __html: currentSectionData?.content }} className="text-lg leading-relaxed text-base-content/80" />
                                    </div>
                                )}
                                {activeTab === 'listening' && (
                                    <div className="flex flex-col items-center justify-center h-full space-y-8">
                                        <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center text-5xl text-purple-600 animate-pulse">
                                            <PiEarFill />
                                        </div>
                                        <audio controls src={currentSectionData?.audioUrl} className="w-full max-w-md" />
                                        <p className="text-center text-base-content/40 font-bold uppercase tracking-widest">Section Recording Player</p>
                                    </div>
                                )}
                                {activeTab === 'writing' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">Writing Task Prompt</h2>
                                        <div dangerouslySetInnerHTML={{ __html: currentSectionData?.content }} className="text-lg bg-base-100 p-8 rounded-[2rem] border border-base-300 shadow-inner" />
                                    </div>
                                )}
                                {activeTab === 'speaking' && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                        <PiMicrophoneStageFill className="text-6xl text-green-500" />
                                        <h3 className="text-2xl font-black">Speaking Evaluation</h3>
                                        <p className="text-base-content/50">Instructor-led speaking assessments are conducted live. Review the recording below if available.</p>
                                        <div className="w-full h-1 bg-base-200 rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-success" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Answer Comparison */}
                            <div className="space-y-6">
                                {['reading', 'listening'].includes(activeTab) ? (
                                    currentSectionResult.answers.map((ans, idx) => (
                                        <div key={idx} className={`card p-6 rounded-3xl border shadow-sm transition-all ${
                                            ans.isCorrect ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
                                        }`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-white border border-base-300 flex items-center justify-center font-black text-sm shadow-sm">{idx + 1}</span>
                                                        <span className="text-xs font-black uppercase tracking-widest text-base-content/30">Question Analysis</span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Your Answer</p>
                                                            <p className={`font-black text-lg ${ans.isCorrect ? "text-success" : "text-error"}`}>
                                                                {ans.userAnswer || "No Answer"}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Correct Answer</p>
                                                            <p className="font-black text-lg text-success">{ans.correctAnswer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-3xl">
                                                    {ans.isCorrect ? <PiCheckCircleFill className="text-success" /> : <PiXCircleFill className="text-error" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="card bg-white p-10 rounded-[3rem] border border-base-300 shadow-sm space-y-6">
                                        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                            <PiPencilLineFill className="text-primary" />
                                            Your Submission
                                        </h3>
                                        <div className="bg-base-100 p-8 rounded-[2rem] border border-base-300 shadow-inner min-h-[300px] leading-relaxed whitespace-pre-wrap font-medium text-base-content/80">
                                            {currentSectionResult.answers[0]?.userAnswer || "No response recorded."}
                                        </div>
                                        <div className="alert alert-info rounded-2xl shadow-sm border-none bg-primary/10 text-primary">
                                            <PiInfoFill className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Evaluation in progress. Band descriptors will be visible once graded.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReviewDetail;
