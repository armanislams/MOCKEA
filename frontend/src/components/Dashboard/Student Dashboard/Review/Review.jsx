import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { 
    PiClipboardText, 
    PiCheckCircleFill, 
    PiHourglassFill, 
    PiWarningCircleFill,
    PiCaretRightBold,
    PiBookOpen,
    PiEar,
    PiPencilLine,
    PiMicrophoneStage
} from "react-icons/pi";

const Review = () => {
    const axiosSecure = useAxiosSecure();

    const { data: results = [], isLoading } = useQuery({
        queryKey: ["user-mock-results"],
        queryFn: async () => {
            const res = await axiosSecure.get("/mock-tests/results/user");
            return res.data.results ?? [];
        }
    });

    const getStatusIcon = (isGraded) => {
        return isGraded 
            ? <PiCheckCircleFill className="text-success w-5 h-5" /> 
            : <PiHourglassFill className="text-warning w-5 h-5 animate-pulse" />;
    };

    const getModuleIcon = (type) => {
        switch(type) {
            case 'reading': return <PiBookOpen className="text-blue-500" />;
            case 'listening': return <PiEar className="text-purple-500" />;
            case 'writing': return <PiPencilLine className="text-orange-500" />;
            case 'speaking': return <PiMicrophoneStage className="text-green-500" />;
            default: return <PiClipboardText />;
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-black mb-2">Performance Tracking</p>
                <h1 className="text-4xl font-black tracking-tight">Exam Review & Results</h1>
                <p className="text-base-content/60 mt-3 max-w-2xl text-lg leading-relaxed">
                    Track your IELTS progress. Reading and Listening scores are available instantly, 
                    while Writing and Speaking are manually graded by our experts.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {isLoading ? (
                    [1, 2].map(i => <div key={i} className="h-48 bg-base-300 animate-pulse rounded-[2.5rem]" />)
                ) : results.length > 0 ? (
                    results.map((result) => (
                        <div key={result._id} className="group card bg-white border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                                {/* Left: Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="badge badge-primary badge-sm font-black uppercase tracking-widest px-3 py-3 rounded-lg">Mock Test</span>
                                        <span className="text-xs font-bold text-base-content/30 uppercase tracking-widest">
                                            {new Date(result.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                                        {result.testId?.title}
                                    </h2>
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-base-content/50 uppercase tracking-widest">
                                            <PiWarningCircleFill className="text-error" /> {result.tabSwitchCount} Tab Switches
                                        </div>
                                        <div className="badge badge-ghost font-bold uppercase text-[10px] tracking-widest px-4 py-3">
                                            Status: {result.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Section Scores */}
                                <div className="flex flex-wrap gap-4">
                                    {['reading', 'listening', 'writing', 'speaking'].map((type) => {
                                        const section = result.sectionResults.find(s => s.sectionType === type);
                                        return (
                                            <div key={type} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-base-100 border border-base-200 min-w-[100px] group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                                <div className="text-2xl">{getModuleIcon(type)}</div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black uppercase tracking-tighter">{type[0]}</span>
                                                    {getStatusIcon(section?.isGraded)}
                                                </div>
                                                <div className="text-lg font-black text-primary">
                                                    {section?.isGraded ? section.score : "--"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Link 
                                    to={`/dashboard/review/${result._id}`}
                                    className="btn btn-ghost btn-circle self-center hidden lg:flex group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-base-200"
                                >
                                    <PiCaretRightBold />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-base-300 rounded-[3rem] text-center space-y-6">
                        <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center text-4xl text-base-content/20 shadow-inner">
                            <PiClipboardText />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight">No Test Results Found</h2>
                            <p className="text-base-content/50 max-w-sm mx-auto">
                                You haven't completed any full mock tests yet. Your detailed performance breakdown will appear here once you finish your first test.
                            </p>
                        </div>
                        <Link to="/dashboard/full-mock-test" className="btn btn-primary rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/20">
                            Start Your First Mock Test
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;
