import { 
    PiBookOpen, 
    PiEar, 
    PiPencilLine, 
    PiMicrophoneStage,
    PiPlayCircle,
    PiUsers
} from "react-icons/pi";

const MockTestCard = ({ test, index, onStart }) => {
    return (
        <div className="card bg-white border border-base-300 shadow-sm p-8 rounded-[2rem] hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-primary relative overflow-hidden">
            {test.planType === 'free' && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                    Free
                </div>
            )}

            <div className="flex flex-col h-full space-y-8">
                <div className="flex items-start gap-4">
                    <div className="text-6xl font-black text-base-content/10 select-none">{index}</div>
                    <div className="pt-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Test {index}</p>
                        <h3 className="text-2xl font-bold mt-1 group-hover:text-primary transition-colors">{test.title || `Test ${index}`}</h3>
                        <p className="text-sm text-base-content/50 mt-1 flex items-center gap-2">
                            <PiClock className="w-4 h-4" /> ~{test.totalDuration || 165} min
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 text-2xl text-base-content/30">
                    <PiEar className={test.sections?.listening?.length ? "text-primary/40" : ""} />
                    <PiBookOpen className={test.sections?.reading?.length ? "text-primary/40" : ""} />
                    <PiPencilLine className={test.sections?.writing?.length ? "text-primary/40" : ""} />
                    <PiMicrophoneStage className={test.sections?.speaking?.length ? "text-primary/40" : ""} />
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-xs text-base-content/40 font-medium">
                        <PiUsers className="w-4 h-4" />
                        <span>Be the first</span>
                        <span className="mx-2">·</span>
                        <span>4 sections · ~{test.totalDuration || 165} min</span>
                    </div>
                </div>

                <button 
                    onClick={onStart}
                    className="btn btn-neutral bg-black hover:bg-primary text-white w-full rounded-2xl h-14 text-lg gap-3 border-none shadow-lg shadow-black/10"
                >
                    <PiPlayCircle className="w-6 h-6" />
                    Start Full Test
                </button>
            </div>
        </div>
    );
};

// Add missing icon
const PiClock = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default MockTestCard;
