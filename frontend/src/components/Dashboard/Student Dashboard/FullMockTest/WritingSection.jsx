import { useState, useEffect } from "react";
import { PiPencilLine, PiTextT, PiImage, PiWarningCircle } from "react-icons/pi";

const WritingSection = ({ data, answers, onAnswerChange }) => {
    const [wordCount, setWordCount] = useState(0);

    const currentAnswer = answers[data?._id] || "";

    useEffect(() => {
        const words = currentAnswer.trim().split(/\s+/).filter(w => w.length > 0);
        setWordCount(words.length);
    }, [currentAnswer]);

    return (
        <div className="flex h-full overflow-hidden bg-white">
            {/* Left Pane: Prompt & Image */}
            <div className="w-1/2 overflow-y-auto p-12 border-r border-base-200 bg-base-50/30">
                <div className="max-w-2xl mx-auto space-y-8">
                    <header className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Writing Task 1</p>
                        <h1 className="text-3xl font-extrabold tracking-tight">Academic Writing Task</h1>
                    </header>

                    <div className="p-8 rounded-[2.5rem] bg-white border border-base-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <PiWarningCircle className="w-6 h-6" />
                            <span>Instructions</span>
                        </div>
                        <p className="text-lg leading-relaxed text-base-content/80">
                            {data?.instructions || "You should spend about 20 minutes on this task. Write about the following topic:"}
                        </p>
                        
                        <div className="prose prose-lg font-medium text-base-content">
                            {data?.passage || "The chart below shows the percentage of households with access to the internet in different regions between 2010 and 2020."}
                        </div>

                        {data?.images?.length > 0 && (
                            <div className="mt-8 rounded-3xl overflow-hidden border border-base-200 shadow-inner">
                                <img 
                                    src={data.images[0]} 
                                    alt="Writing Task Prompt" 
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        <div className="pt-4 flex items-center gap-4 text-sm font-bold text-base-content/40">
                            <div className="flex items-center gap-1"><PiClock /> 20 Minutes</div>
                            <div className="flex items-center gap-1"><PiTextT /> Min 150 Words</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Writing Area */}
            <div className="w-1/2 flex flex-col p-12">
                <div className="flex-1 flex flex-col space-y-4 max-w-2xl w-full mx-auto">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <PiPencilLine className="text-primary" />
                            Your Response
                        </h2>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${
                            wordCount >= 150 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}>
                            Words: {wordCount}
                        </div>
                    </div>

                    <textarea 
                        className="flex-1 w-full p-8 rounded-[2rem] border-2 border-base-200 focus:border-primary outline-none text-lg leading-relaxed font-serif resize-none shadow-inner bg-base-50/20"
                        placeholder="Start writing your essay here..."
                        value={currentAnswer}
                        onChange={(e) => onAnswerChange(data?._id, e.target.value)}
                    />

                    <div className="p-4 flex items-center gap-3 text-xs text-base-content/40 font-medium italic">
                        <PiCheckCircle />
                        Answers are automatically saved every 30 seconds.
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mock icon for internal use
const PiClock = () => (
    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default WritingSection;
