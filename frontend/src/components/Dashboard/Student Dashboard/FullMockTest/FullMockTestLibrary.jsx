import { useQuery } from "@tanstack/react-query";
import { 
    PiBookOpen, 
    PiEar, 
    PiPencilLine, 
    PiMicrophoneStage,
    PiArrowRight,
    PiClock,
    PiUsers,
    PiCards
} from "react-icons/pi";
import { useState } from "react";
import MockTestCard from "./MockTestCard";
import InstructionModal from "./InstructionModal";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const FullMockTestLibrary = () => {
    const axiosSecure = useAxiosSecure();
    const [selectedTest, setSelectedTest] = useState(null);

    const { data: tests = [], isLoading } = useQuery({
        queryKey: ["full-mock-tests"],
        queryFn: async () => {
            const res = await axiosSecure.get("/mock-tests");
            return res.data.tests ?? [];
        }
    });

    const stats = [
        { label: "Full Mock Tests", value: tests.length, icon: <PiCards className="text-blue-500" /> },
        { label: "Total Sections", value: tests.length * 4, icon: <PiBookOpen className="text-purple-500" /> },
        { label: "Hours of Content", value: (tests.reduce((acc, t) => acc + (t.totalDuration || 0), 0) / 60).toFixed(1) + "h", icon: <PiClock className="text-orange-500" /> },
    ];

    return (
        <div className="min-h-screen space-y-10 p-4 md:p-8 max-w-7xl mx-auto">
            <header className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                    IELTS Academic
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">Full Mock Test Library</h1>
                        <p className="text-base-content/60 text-lg">Complete 4-section IELTS practice tests — Listening, Reading, Writing & Speaking</p>
                    </div>
                </div>

                {/* Section Filters/Badges */}
                <div className="flex flex-wrap gap-3 pt-2">
                    {[
                        { label: "Listening", time: "40 min", icon: <PiEar />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                        { label: "Reading", time: "60 min", icon: <PiBookOpen />, color: "bg-blue-50 text-blue-600 border-blue-100" },
                        { label: "Writing", time: "60 min", icon: <PiPencilLine />, color: "bg-purple-50 text-purple-600 border-purple-100" },
                        { label: "Speaking", time: "~15 min", icon: <PiMicrophoneStage />, color: "bg-orange-50 text-orange-600 border-orange-100" },
                    ].map((s) => (
                        <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${s.color}`}>
                            {s.icon} <span>{s.label} · {s.time}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s) => (
                    <div key={s.label} className="card bg-white border border-base-300 shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-2 hover:shadow-md transition-shadow">
                        <div className="text-4xl font-black">{s.value}</div>
                        <div className="text-sm font-bold text-base-content/40 uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Test List */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">🎁</span>
                        Free Practice Tests
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-64 bg-base-300 animate-pulse rounded-3xl" />)
                    ) : (
                        tests.filter(t => t.planType === 'free').map((test, index) => (
                            <MockTestCard 
                                key={test._id} 
                                test={test} 
                                index={index + 1} 
                                onStart={() => setSelectedTest(test)} 
                            />
                        ))
                    )}
                </div>
            </section>

            {selectedTest && (
                <InstructionModal 
                    test={selectedTest} 
                    onClose={() => setSelectedTest(null)} 
                />
            )}
        </div>
    );
};

export default FullMockTestLibrary;
