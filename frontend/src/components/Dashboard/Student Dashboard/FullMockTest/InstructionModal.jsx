import { 
    PiBookOpen, 
    PiEar, 
    PiPencilLine, 
    PiMicrophoneStage,
    PiX,
    PiWarning,
    PiClock,
    PiCheckCircle,
    PiLightning
} from "react-icons/pi";
import { useNavigate } from "react-router";

const InstructionModal = ({ test, onClose }) => {
    const navigate = useNavigate();

    const modules = [
        { label: "Reading", duration: "60 minutes", details: "3 passages · 40 questions", icon: <PiBookOpen /> },
        { label: "Listening", duration: "30 minutes", details: "4 parts · 40 questions", icon: <PiEar /> },
        { label: "Writing", duration: "60 minutes", details: "2 tasks", icon: <PiPencilLine /> },
    ];

    const handleStart = () => {
        navigate(`/test/${test._id}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <PiBookOpen className="w-8 h-8" />
                        IELTS Full Mock Test Instructions
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20">
                        <PiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Test Modules */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <PiFiles className="text-primary" /> Test Modules
                        </h3>
                        <div className="space-y-3">
                            {modules.map((m) => (
                                <div key={m.label} className="flex items-center justify-between p-4 rounded-2xl bg-base-100 border border-base-200">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xl text-primary">{m.icon}</div>
                                        <div>
                                            <span className="font-bold">{m.label}</span>
                                            <span className="text-base-content/40 mx-2">—</span>
                                            <span className="text-sm text-base-content/60">{m.duration} · {m.details}</span>
                                        </div>
                                    </div>
                                    <PiCheckCircle className="text-emerald-500" />
                                </div>
                            ))}
                            <div className="flex items-center gap-2 p-2 text-primary font-bold">
                                <PiClock className="w-5 h-5" />
                                <span>Total estimated time: ~2.5 hours</span>
                            </div>
                        </div>
                    </section>

                    {/* General Instructions */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                            <PiLightning /> General Instructions
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "The test will proceed in order: Reading → Listening → Writing",
                                "Each module has its own timer. You cannot go back to a previous module.",
                                "Your answers are auto-saved as you progress",
                                "Do not refresh or leave the page during the test",
                                "Tab switching is monitored. After 3 switches, your test will be auto-submitted."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-base-content/70">
                                    <div className="mt-1 flex-none w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                                        {i + 1}
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Important Warning */}
                    <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-4">
                        <PiWarning className="w-8 h-8 text-orange-500 flex-none" />
                        <div>
                            <p className="font-bold text-orange-600">Important</p>
                            <p className="text-sm text-orange-800 leading-relaxed mt-1">
                                Once the test begins, timers cannot be paused. Make sure you are in a quiet environment with a stable internet connection.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button onClick={onClose} className="btn btn-outline flex-1 rounded-2xl h-14 font-bold border-base-300">
                            Go Back
                        </button>
                        <button onClick={handleStart} className="btn btn-primary flex-1 rounded-2xl h-14 font-bold shadow-lg shadow-primary/20">
                            Start Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add missing icon
const PiFiles = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

export default InstructionModal;
