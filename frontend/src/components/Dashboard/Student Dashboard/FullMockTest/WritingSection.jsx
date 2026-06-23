import React, { useState, useMemo } from "react";
import { 
    PiPencilLine, 
    PiTextT, 
    PiWarningCircle, 
    PiCheckCircle, 
    PiClock, 
    PiBookOpen 
} from "react-icons/pi";

const WritingSection = ({ data, answers, onAnswerChange }) => {
    const [activeTab, setActiveTab] = useState("task1"); // "task1" or "task2"

    const rawText = answers[data?._id] || "";

    const { task1Text, task2Text } = useMemo(() => {
        let t1 = "";
        let t2 = "";
        if (rawText.includes("--- TASK 2")) {
            const match = rawText.match(/--- TASK 1.*---\n([\s\S]*?)\n\n--- TASK 2.*---\n([\s\S]*)/);
            if (match) {
                t1 = match[1];
                t2 = match[2];
            } else {
                const parts = rawText.split(/--- TASK 2.*---\n?/);
                t1 = parts[0].replace(/--- TASK 1.*---\n?/, "");
                if (t1.endsWith("\n\n")) t1 = t1.slice(0, -2);
                t2 = parts[1] || "";
            }
        } else {
            t1 = rawText;
        }
        return { task1Text: t1, task2Text: t2 };
    }, [rawText]);

    const handleTextChange = (tab, newText) => {
        let nextT1 = task1Text;
        let nextT2 = task2Text;
        if (tab === "task1") {
            nextT1 = newText;
        } else {
            nextT2 = newText;
        }

        // Combine with standard separators matching IELTS mocks
        const combined = `--- TASK 1 (150 Words Requirement) ---\n${nextT1}\n\n--- TASK 2 (250 Words Requirement) ---\n${nextT2}`;
        onAnswerChange(data?._id, combined);
    };

    const wordCount1 = task1Text.trim() ? task1Text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    const wordCount2 = task2Text.trim() ? task2Text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    
    const currentWordCount = activeTab === "task1" ? wordCount1 : wordCount2;
    const currentText = activeTab === "task1" ? task1Text : task2Text;
    const targetWords = activeTab === "task1" ? 150 : 250;
    const recommendedTime = activeTab === "task1" ? "20 Minutes" : "40 Minutes";

    return (
        <div className="flex h-full overflow-hidden bg-white">
            {/* Left Pane: Prompt & References */}
            <div className="w-[40%] flex flex-col h-full border-r border-slate-200 bg-slate-50/20">
                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <header className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                                {activeTab === "task1" ? "Writing Task 1" : "Writing Task 2"}
                            </p>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                                {activeTab === "task1" ? "Academic Report Description" : "Opinion & Discussion Essay"}
                            </h1>
                        </header>

                        {/* Interactive Dynamic Guideline Box */}
                        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <PiWarningCircle className="w-6 h-6" />
                                <span>IELTS Official Guidelines</span>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed text-sm">
                                {activeTab === "task1" 
                                    ? "You should spend about 20 minutes on this task. Write at least 150 words summarizing the main features of the visual representation, and make comparisons where relevant."
                                    : "You should spend about 40 minutes on this task. Write at least 250 words discussing both viewpoints, giving your own opinion, and supporting your arguments with relevant examples."}
                            </p>
                            
                            <div className="pt-4 flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-400 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <PiClock className="w-4 h-4 text-primary" /> 
                                    <span>{recommendedTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <PiTextT className="w-4 h-4 text-primary" /> 
                                    <span>Min {targetWords} Words</span>
                                </div>
                            </div>
                        </div>

                        {/* Complete Prompts Material */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                                <PiBookOpen className="text-lg" />
                                <span>Prompt Text & Reference Materials</span>
                            </div>
                            <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium text-sm">
                                    {data?.passage ? (
                                        <div dangerouslySetInnerHTML={{ __html: data.passage }} />
                                    ) : (
                                        <p className="text-slate-400 italic">No prompt material loaded.</p>
                                    )}
                                </div>

                                {data?.images?.filter(img => img && img.trim() !== "").length > 0 && (
                                    <div className="mt-8 grid gap-4">
                                        {data.images.filter(img => img && img.trim() !== "").map((img, i) => (
                                            <div key={i} className="rounded-3xl overflow-hidden border border-slate-100 p-2 bg-slate-50">
                                                <img 
                                                    src={img} 
                                                    alt={`Writing Task diagram ${i + 1}`} 
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Question Palette */}
                <div className="p-6 border-t border-slate-200 bg-white">
                    <div className="max-w-2xl mx-auto flex flex-col gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Writing Modules Navigation</span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setActiveTab("task1")}
                                className={`h-11 px-6 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                                    activeTab === "task1" 
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 animate-none" 
                                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600"
                                }`}
                            >
                                <span>Task 1</span>
                                <span className={`text-[10px] py-0.5 px-2 rounded-lg ${activeTab === "task1" ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>
                                    {wordCount1} w
                                </span>
                            </button>

                            <button 
                                onClick={() => setActiveTab("task2")}
                                className={`h-11 px-6 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
                                    activeTab === "task2" 
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 animate-none" 
                                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600"
                                }`}
                            >
                                <span>Task 2</span>
                                <span className={`text-[10px] py-0.5 px-2 rounded-lg ${activeTab === "task2" ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>
                                    {wordCount2} w
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Writing Canvas */}
            <div className="w-[60%] flex flex-col p-12 bg-white">
                <div className="flex-1 flex flex-col space-y-6 max-w-2xl w-full mx-auto">
                    {/* Header Controls inside right pane */}
                    <div className="flex items-center justify-between">
                        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1.5 shadow-inner">
                            <button 
                                onClick={() => setActiveTab("task1")}
                                className={`py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === "task1" 
                                    ? "bg-white text-slate-800 shadow-sm" 
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Task 1
                            </button>
                            <button 
                                onClick={() => setActiveTab("task2")}
                                className={`py-2 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === "task2" 
                                    ? "bg-white text-slate-800 shadow-sm" 
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Task 2
                            </button>
                        </div>

                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border-2 transition-all ${
                            currentWordCount >= targetWords 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}>
                            Words: {currentWordCount} / {targetWords} Target
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 flex flex-col relative">
                        <textarea 
                            className="flex-1 w-full p-10 rounded-[2.5rem] border-2 border-slate-400 focus:border-primary/30 focus:ring-0 outline-none text-lg leading-relaxed font-serif resize-none shadow-sm bg-slate-50/10 placeholder:text-slate-300"
                            placeholder={
                                activeTab === "task1" 
                                ? "Write your Task 1 academic report here (minimum 150 words)..." 
                                : "Write your Task 2 argumentative opinion essay here (minimum 250 words)..."
                            }
                            value={currentText}
                            onChange={(e) => handleTextChange(activeTab, e.target.value)}
                        />
                    </div>

                    <div className="p-4 flex items-center gap-3 text-xs text-slate-400 font-semibold italic">
                        <PiCheckCircle className="text-emerald-500 w-4 h-4" />
                        <span>Mock exam response autosaves to your local recovery cache automatically.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WritingSection;
