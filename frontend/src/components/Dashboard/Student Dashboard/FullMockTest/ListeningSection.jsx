import { useState, useRef, useMemo, useEffect } from "react";
import { PiEar, PiPlayCircle, PiPauseCircle, PiClock } from "react-icons/pi";

const convertMarkdownTablesToHtml = (text) => {
    if (!text) return "";
    
    let hasWrapper = false;
    let wrapperClass = "ielts-listening-notes space-y-4";
    let cleanedText = text.trim();
    
    const wrapperMatch = cleanedText.match(/^<div class=["'](ielts-listening-notes[^"']*)["']>/);
    if (wrapperMatch && cleanedText.endsWith("</div>")) {
        hasWrapper = true;
        wrapperClass = wrapperMatch[1];
        cleanedText = cleanedText.substring(wrapperMatch[0].length, cleanedText.length - 6).trim();
    }

    const lines = cleanedText.split("\n");
    let inTable = false;
    let tableHtml = "";
    const result = [];
    let rowCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("|") && line.endsWith("|")) {
            if (!inTable) {
                inTable = true;
                tableHtml = '<div class="overflow-x-auto my-6"><table class="table-auto w-full text-left border-collapse border border-slate-200 text-sm">';
                rowCount = 0;
            }
            const cells = line.split("|").slice(1, -1).map(c => c.trim());
            const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
            if (isSeparator) {
                if (tableHtml.includes("<thead>") && !tableHtml.includes("</thead>")) {
                    tableHtml += "</thead><tbody class=\"text-slate-700\">";
                }
                continue;
            }
            if (!tableHtml.includes("<thead>")) {
                tableHtml += "<thead><tr class=\"bg-slate-100 text-slate-800 font-bold\">";
                cells.forEach(c => {
                    tableHtml += `<th class="border border-slate-200 p-3">${c}</th>`;
                });
                tableHtml += "</tr>";
            } else {
                const rowClass = rowCount % 2 === 1 ? "bg-slate-50/30" : "";
                tableHtml += `<tr class="${rowClass}">`;
                cells.forEach(c => {
                    tableHtml += `<td class="border border-slate-200 p-3">${c}</td>`;
                });
                tableHtml += "</tr>";
                rowCount++;
            }
        } else {
            if (inTable) {
                inTable = false;
                if (tableHtml.includes("<tbody>") && !tableHtml.includes("</tbody>")) {
                    tableHtml += "</tbody>";
                } else if (tableHtml.includes("<thead>") && !tableHtml.includes("</thead>")) {
                    tableHtml += "</thead>";
                }
                tableHtml += "</table></div>";
                result.push(tableHtml);
                tableHtml = "";
            }
            result.push(lines[i]);
        }
    }
    if (inTable) {
        if (tableHtml.includes("<tbody>") && !tableHtml.includes("</tbody>")) {
            tableHtml += "</tbody>";
        } else if (tableHtml.includes("<thead>") && !tableHtml.includes("</thead>")) {
            tableHtml += "</thead>";
        }
        tableHtml += "</table></div>";
        result.push(tableHtml);
    }
    
    const finalHtml = result.join("\n");
    return hasWrapper ? `<div class="${wrapperClass}">${finalHtml}</div>` : finalHtml;
};

const InlinePassage = ({ passage, questions, answers, onAnswerChange, submitted, result, offset, className = "leading-relaxed text-slate-700" }) => {
    const containerRef = useRef(null);

    const processedPassage = useMemo(() => {
        const text = convertMarkdownTablesToHtml(passage);
        const hasInlinePlaceholders = /___([\w-]+)___/.test(text);
        if (!hasInlinePlaceholders) {
            return text;
        }

        return text.replace(/___([\w-]+)___/g, (match, matchKey) => {
            const q = questions.find((item, idx) => {
                const questionNum = offset + idx + 1;
                const localIndex = idx + 1;
                return (
                    item.id === matchKey ||
                    questionNum.toString() === matchKey ||
                    localIndex.toString() === matchKey
                );
            });
            if (!q) return match;

            const qIndexInSet = questions.indexOf(q);
            const labelNum = offset + qIndexInSet + 1;

            const qId = q.id;
            const evaluation = result?.evaluatedAnswers?.find((a) => a.questionId === qId);
            const isCorrect = evaluation?.isCorrect;
            
            const isMockTest = submitted === undefined;
            
            let inputClass = "inline-block px-3 py-1 text-sm font-bold bg-white border-2 rounded-lg outline-none transition-all text-center focus:ring-2 focus:ring-primary/20 w-36";
            if (isMockTest) {
                inputClass = "inline-block h-10 px-3 py-1 rounded-xl w-36 font-bold border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-center outline-none bg-white transition-all";
            } else if (submitted) {
                inputClass += isCorrect
                    ? " border-emerald-400 bg-emerald-50 text-emerald-700"
                    : " border-red-400 bg-red-50 text-red-700";
            } else {
                inputClass += " border-slate-300 focus:border-primary hover:border-slate-400";
            }

            let badgeHtml = "";
            if (!isMockTest && submitted) {
                badgeHtml = isCorrect
                    ? `<span class="badge badge-success text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✓</span>`
                    : `<span class="badge badge-error text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✗</span>`;
            }

            let tooltipHtml = "";
            if (!isMockTest && submitted && !isCorrect) {
                tooltipHtml = `<span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg z-50 whitespace-nowrap">✓ ${q.correctAnswer}</span>`;
            }

            const titleAttr = (!isMockTest && submitted && !isCorrect) ? `Correct Answer: ${q.correctAnswer}` : "";

            return `
                <span class="inline-flex items-center gap-1 mx-1.5 relative group align-baseline">
                    <input
                        type="text"
                        data-q-id="${qId}"
                        ${(!isMockTest && submitted) ? "disabled" : ""}
                        placeholder="(${labelNum})"
                        value=""
                        class="${inputClass}"
                        title="${titleAttr}"
                    />
                    ${badgeHtml}
                    ${tooltipHtml}
                </span>
            `.trim();
        });
    }, [passage, questions, submitted, result, offset]);

    useEffect(() => {
        if (containerRef.current) {
            const inputs = containerRef.current.querySelectorAll('input[data-q-id]');
            inputs.forEach(input => {
                const qId = input.getAttribute('data-q-id');
                const value = answers[qId] || "";
                if (input.value !== value) {
                    input.value = value;
                }
            });
        }
    }, [answers, processedPassage]);

    useEffect(() => {
        const handleInput = (e) => {
            if (e.target && e.target.hasAttribute('data-q-id')) {
                const qId = e.target.getAttribute('data-q-id');
                onAnswerChange(qId, e.target.value);
            }
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener('input', handleInput);
        }
        return () => {
            if (container) {
                container.removeEventListener('input', handleInput);
            }
        };
    }, [onAnswerChange]);

    return (
        <div 
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: processedPassage }}
        />
    );
};

const ListeningSection = ({ data, answers, onAnswerChange }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const offset = ((data?.listeningPart || 1) - 1) * 10;

    const renderedInlineIds = useMemo(() => {
        if (!data?.passage) return new Set();
        const matches = data.passage.match(/___([\w-]+)___/g) || [];
        const ids = new Set();
        
        matches.forEach(m => {
            const matchKey = m.replace(/___/g, "").trim();
            const q = data.questions?.find((item, idx) => {
                const questionNum = offset + idx + 1;
                const localIndex = idx + 1;
                return (
                    item.id === matchKey ||
                    questionNum.toString() === matchKey ||
                    localIndex.toString() === matchKey
                );
            });
            if (q) {
                ids.add(q.id);
            }
        });
        return ids;
    }, [data?.passage, data?.questions, offset]);

    const remainingQuestions = useMemo(() => {
        return data?.questions?.filter(q => !renderedInlineIds.has(q.id)) || [];
    }, [data?.questions, renderedInlineIds]);

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

                    {/* ── Passage (HTML with Inline Inputs) ── */}
                    {data?.passage && data.passage.trim() !== "" && (
                        <div className="p-8 rounded-[2rem] border border-base-200 bg-white shadow-xs prose prose-sm max-w-none">
                            <InlinePassage
                                passage={data.passage}
                                questions={data.questions || []}
                                answers={answers}
                                onAnswerChange={onAnswerChange}
                                offset={offset}
                            />
                        </div>
                    )}

                    {remainingQuestions.length > 0 && (
                        <div className="space-y-8">
                            {remainingQuestions.map((q) => {
                                const idx = data.questions.findIndex(item => item.id === q.id);
                                return (
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
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListeningSection;
