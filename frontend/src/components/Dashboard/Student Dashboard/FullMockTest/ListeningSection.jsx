import { useState, useRef } from "react";
import { PiEar, PiPlayCircle, PiPauseCircle, PiClock } from "react-icons/pi";

const ListeningSection = ({ data, answers, onAnswerChange }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const offset = ((data?.listeningPart || 1) - 1) * 10;

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex h-full overflow-hidden bg-white">
            {/* Left Pane: Audio Control & Instructions with Sticky Palette */}
            <div className="w-1/2 flex flex-col h-full border-r border-base-200 bg-base-50/10">
                <div className="flex-1 overflow-y-auto p-12 space-y-8">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <header className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Listening Section</p>
                            <h1 className="text-3xl font-extrabold tracking-tight">Audio — Section {data?.title || "1"}</h1>
                        </header>

                        {/* Audio control card */}
                        <div className="p-8 rounded-[2.5rem] bg-white border border-base-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={togglePlay}
                                    className="btn btn-primary btn-circle btn-lg shadow-lg shadow-primary/20"
                                >
                                    {isPlaying ? <PiPauseCircle className="w-8 h-8" /> : <PiPlayCircle className="w-8 h-8" />}
                                </button>
                                <div>
                                    <h2 className="font-bold text-lg">Control Board</h2>
                                    <p className="text-xs text-base-content/50 font-medium">Click play to begin. You will hear the recording only ONCE.</p>
                                </div>
                            </div>
                            
                            <audio 
                                ref={audioRef} 
                                src={data?.audioUrl} 
                                onEnded={() => setIsPlaying(false)}
                                className="hidden" 
                            />
                        </div>

                        {/* Instructions */}
                        <div className="p-6 rounded-2xl bg-white border border-base-200 shadow-sm">
                            <h3 className="font-bold mb-2">Instructions:</h3>
                            <p className="text-sm text-base-content/60 leading-relaxed">
                                Listen to the audio and answer the questions on the right. For gap-fill questions, use NO MORE THAN TWO WORDS and/or a number.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sticky Question Palette */}
                <div className="p-6 border-t border-base-200 bg-white">
                    <div className="max-w-2xl mx-auto flex flex-col gap-3">
                        <span className="text-[10px] font-black text-base-content/30 uppercase tracking-widest">Question Palette</span>
                        <div className="flex flex-wrap gap-2">
                            {data?.questions?.map((q, i) => {
                                const isAnswered = !!answers[q.id];
                                return (
                                    <button 
                                        key={q.id || i} 
                                        onClick={() => {
                                            const element = document.getElementById(`question-${i}`);
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }}
                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border-b-2 ${
                                            isAnswered 
                                            ? "bg-primary text-white border-primary-dark shadow-lg shadow-primary/20" 
                                            : "bg-base-200 border-base-300 hover:bg-base-300"
                                        }`}
                                    >
                                        {offset + i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Questions */}
            <div className="w-1/2 overflow-y-auto p-12 bg-base-100">
                <div className="max-w-xl mx-auto space-y-12">
                    <header className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <PiEar className="w-8 h-8" />
                            <h2 className="text-2xl font-black uppercase tracking-widest">Questions {offset + 1}–{offset + (data?.questions?.length || 10)}</h2>
                        </div>
                    </header>

                    <div className="space-y-8">
                        {data?.questions?.map((q, idx) => (
                            <div 
                                key={q.id || idx} 
                                id={`question-${idx}`}
                                className="space-y-4 p-6 rounded-3xl border border-base-200 bg-white hover:border-primary/30 transition-colors scroll-mt-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-none w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                        {offset + idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <p className="text-lg font-semibold leading-snug">
                                            {q.question}
                                        </p>

                                        {q.type === 'multiple-choice' && (
                                            <div className="grid grid-cols-1 gap-2">
                                                {q.options?.map((opt, optIdx) => (
                                                    <button 
                                                        key={optIdx}
                                                        onClick={() => onAnswerChange(q.id, opt)}
                                                        className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold border-2 transition-all flex items-center gap-4 ${
                                                            answers[q.id] === opt 
                                                            ? "bg-primary border-primary text-white shadow-md shadow-primary/10" 
                                                            : "bg-base-50 border-transparent hover:border-primary/20"
                                                        }`}
                                                    >
                                                        <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {(q.type === 'short-answer' || q.type === 'sentence-completion') && (
                                            <input 
                                                type="text"
                                                value={answers[q.id] || ""}
                                                onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                                placeholder="Type your answer here..."
                                                className="input input-bordered w-full rounded-2xl h-14 bg-base-50 border-transparent focus:border-primary font-bold"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningSection;
