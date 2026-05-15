import { useState } from "react";
import { PiBookOpen, PiNotePencil } from "react-icons/pi";

const ReadingSection = ({ data, answers, onAnswerChange }) => {
    const [selectedQuestion, setSelectedQuestion] = useState(0);

    return (
        <div className="flex h-full overflow-hidden bg-white">
            {/* Left Pane: Passage */}
            <div className="w-1/2 overflow-y-auto p-12 border-r border-base-200">
                <div className="max-w-2xl mx-auto space-y-8">
                    <header className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Part 1</p>
                        <h1 className="text-4xl font-extrabold tracking-tight">{data?.passageTitle || data?.title}</h1>
                        <p className="text-base-content/60 italic leading-relaxed text-lg">
                            An exploration of the ancient origins and development of map-making, highlighting key innovations and their impact on navigation, exploration, and understanding of the world.
                        </p>
                    </header>

                    <div className="prose prose-lg max-w-none prose-p:leading-relaxed prose-p:text-base-content/80 prose-headings:font-black font-serif text-xl space-y-6">
                        {data?.passage || data?.sections?.[0]?.content || "No passage content available."}
                    </div>
                </div>
            </div>

            {/* Right Pane: Questions */}
            <div className="w-1/2 overflow-y-auto p-12 bg-base-100">
                <div className="max-w-xl mx-auto space-y-12">
                    <header className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <PiNotePencil className="w-6 h-6" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Questions 1–13</h2>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-base-200 shadow-sm">
                            <h3 className="font-bold mb-2">Instructions:</h3>
                            <p className="text-sm text-base-content/70">
                                Do the following statements agree with the information given in Reading Passage 1? In boxes 1–13 on your answer sheet, write:
                                <br/><br/>
                                <span className="font-bold">TRUE</span> if the statement agrees with the information
                                <br/>
                                <span className="font-bold">FALSE</span> if the statement contradicts the information
                                <br/>
                                <span className="font-bold">NOT GIVEN</span> if there is no information on this
                            </p>
                        </div>
                    </header>

                    <div className="space-y-8">
                        {data?.questions?.map((q, idx) => (
                            <div key={q.id || idx} className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-none w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                                        {idx + 1}
                                    </div>
                                    <p className="text-lg font-medium pt-1">
                                        {q.question}
                                    </p>
                                </div>

                                {q.type === 'true-false' && (
                                    <div className="flex flex-wrap gap-2 ml-14">
                                        {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                                            <button 
                                                key={opt}
                                                onClick={() => onAnswerChange(q.id, opt)}
                                                className={`px-6 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                    answers[q.id] === opt 
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                                    : "bg-white border-base-200 hover:border-primary/40"
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'multiple-choice' && (
                                    <div className="space-y-2 ml-14">
                                        {q.options?.map((opt, optIdx) => (
                                            <button 
                                                key={optIdx}
                                                onClick={() => onAnswerChange(q.id, opt)}
                                                className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold border-2 transition-all flex items-center gap-4 ${
                                                    answers[q.id] === opt 
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                                    : "bg-white border-base-200 hover:border-primary/40"
                                                }`}
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-base-200 text-base-content/40 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadingSection;
