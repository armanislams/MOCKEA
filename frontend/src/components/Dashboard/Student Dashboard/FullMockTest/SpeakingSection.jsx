import { useState, useEffect } from "react";
import { PiMicrophoneStage, PiClock, PiPlay, PiInfo } from "react-icons/pi";

const SpeakingSection = ({ data }) => {
    const [prepTime, setPrepTime] = useState(60);
    const [isPrepActive, setIsPrepActive] = useState(false);
    const [speakingTime, setSpeakingTime] = useState(120);
    const [isSpeakingActive, setIsSpeakingActive] = useState(false);

    useEffect(() => {
        let interval;
        if (isPrepActive) {
            interval = setInterval(() => {
                setPrepTime(prev => {
                    if (prev <= 1) {
                        setIsPrepActive(false);
                        setIsSpeakingActive(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPrepActive]);

    useEffect(() => {
        let interval;
        if (isSpeakingActive) {
            interval = setInterval(() => {
                setSpeakingTime(prev => {
                    if (prev <= 1) {
                        setIsSpeakingActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSpeakingActive]);

    return (
        <div className="flex h-full bg-base-100 overflow-hidden">
            {/* Left Sidebar: Instructions */}
            <div className="w-1/3 p-12 bg-white border-r border-base-200 overflow-y-auto">
                <div className="space-y-8">
                    <header className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Speaking Part 2</p>
                        <h1 className="text-3xl font-black">The Cue Card</h1>
                    </header>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <PiInfo className="w-6 h-6" />
                            <span>Rules of the Task</span>
                        </div>
                        <ul className="space-y-3 text-sm text-base-content/70 leading-relaxed">
                            <li>• You have 1 minute to prepare your notes.</li>
                            <li>• You should speak for 1 to 2 minutes.</li>
                            <li>• The timer will guide you through each stage.</li>
                        </ul>
                    </div>

                    {!isPrepActive && !isSpeakingActive && (
                        <button 
                            onClick={() => setIsPrepActive(true)}
                            className="btn btn-primary btn-lg w-full rounded-2xl h-16 shadow-lg shadow-primary/20 gap-3"
                        >
                            <PiPlay className="w-6 h-6" />
                            Start Preparation
                        </button>
                    )}
                </div>
            </div>

            {/* Right Pane: Main Task */}
            <div className="flex-1 flex flex-col p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto w-full space-y-12">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${isPrepActive ? "border-primary bg-primary/5 text-primary scale-105 shadow-md" : "border-base-200 opacity-40"}`}>
                                <PiClock className={isPrepActive ? "animate-spin" : ""} />
                                <div>
                                    <p className="text-[10px] font-black uppercase">Preparation</p>
                                    <p className="text-xl font-mono font-black">{Math.floor(prepTime / 60)}:{ (prepTime % 60).toString().padStart(2, '0') }</p>
                                </div>
                            </div>
                            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${isSpeakingActive ? "border-emerald-500 bg-emerald-50 text-emerald-600 scale-105 shadow-md" : "border-base-200 opacity-40"}`}>
                                <PiMicrophoneStage className={isSpeakingActive ? "animate-bounce" : ""} />
                                <div>
                                    <p className="text-[10px] font-black uppercase">Speaking</p>
                                    <p className="text-xl font-mono font-black">{Math.floor(speakingTime / 60)}:{ (speakingTime % 60).toString().padStart(2, '0') }</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cue Card Display */}
                    <div className={`card bg-white border-2 p-12 rounded-[3rem] shadow-xl transition-all duration-700 ${isPrepActive || isSpeakingActive ? "opacity-100 translate-y-0" : "opacity-20 translate-y-10 blur-sm pointer-events-none"}`}>
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold border-b border-base-200 pb-6">
                                {data?.question || "Describe a historical building you have visited."}
                            </h2>
                            <div className="space-y-4">
                                <p className="font-bold text-base-content/40 uppercase tracking-widest text-xs">You should say:</p>
                                <div className="prose prose-lg text-base-content/80 font-medium whitespace-pre-line">
                                    {data?.passage || "• Where the building is\n• What it looks like\n• Why it is famous\n• And explain why you chose to visit it."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isSpeakingActive && (
                        <div className="flex items-center justify-center gap-4 animate-pulse">
                            <div className="w-3 h-3 rounded-full bg-error" />
                            <span className="font-black text-error uppercase tracking-widest">Live Recording Session</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeakingSection;
