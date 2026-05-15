import { useState, useRef } from "react";
import { PiEar, PiPlayCircle, PiPauseCircle, PiClock } from "react-icons/pi";

const ListeningSection = ({ data, answers, onAnswerChange }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Audio Control Bar */}
            <div className="bg-primary/5 border-b border-primary/10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={togglePlay}
                        className="btn btn-primary btn-circle btn-lg shadow-lg shadow-primary/20"
                    >
                        {isPlaying ? <PiPauseCircle className="w-8 h-8" /> : <PiPlayCircle className="w-8 h-8" />}
                    </button>
                    <div>
                        <h2 className="font-bold text-lg">Listening Audio — Section {data?.title || "1"}</h2>
                        <p className="text-xs text-base-content/50 font-medium">Click play to begin. You will hear the recording only ONCE.</p>
                    </div>
                </div>
                
                <audio 
                    ref={audioRef} 
                    src={data?.audioUrl} 
                    onEnded={() => setIsPlaying(false)}
                    className="hidden" 
                />

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-base-200 text-sm font-bold">
                    <PiClock className="text-primary" />
                    <span>Time will continue during audio</span>
                </div>
            </div>

            {/* Questions Area */}
            <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-3xl mx-auto space-y-12">
                    <header className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <PiEar className="w-8 h-8" />
                            <h2 className="text-2xl font-black uppercase tracking-widest">Questions 1–40</h2>
                        </div>
                        <div className="p-6 rounded-2xl bg-base-50 border border-base-200">
                            <h3 className="font-bold mb-1">Instructions:</h3>
                            <p className="text-sm text-base-content/60 leading-relaxed">
                                Listen to the audio and answer the questions below. For gap-fill questions, use NO MORE THAN TWO WORDS and/or a number.
                            </p>
                        </div>
                    </header>

                    <div className="space-y-10">
                        {data?.questions?.map((q, idx) => (
                            <div key={q.id || idx} className="space-y-4 p-6 rounded-3xl border border-base-200 bg-white hover:border-primary/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-none w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                        {idx + 1}
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
