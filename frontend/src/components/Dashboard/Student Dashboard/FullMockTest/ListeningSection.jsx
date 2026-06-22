import { useState, useRef, useMemo, useEffect, memo } from "react";
import { PiEar, PiPlayCircle, PiPauseCircle } from "react-icons/pi";
import { collapseListeningExampleBlocks } from "../../../../utils/listeningPassage";

const EMPTY_ARRAY = [];

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
    let inList = false;
    let tableHtml = "";
    let listHtml = "";
    const result = [];
    let rowCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        const formatInlineBullets = (str) => {
            if (!str) return str;
            let formatted = str.trim();
            formatted = formatted.replace(/^[-*]\s+/, '<span class="text-primary font-black mr-1">•</span> ');
            formatted = formatted.replace(/\s*[,;\n]\s*[-*]\s+/g, '<br/><span class="text-primary font-black mr-1">•</span> ');
            formatted = formatted.replace(/\s+[-*]\s+/g, '<br/><span class="text-primary font-black mr-1">•</span> ');
            return formatted;
        };

        if (line.startsWith("|") && line.endsWith("|")) {
            if (inList) {
                inList = false;
                listHtml += '</ul>';
                result.push(listHtml);
                listHtml = "";
            }
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
                    tableHtml += `<th class="border border-slate-200 p-3">${formatInlineBullets(c)}</th>`;
                });
                tableHtml += "</tr>";
            } else {
                const rowClass = rowCount % 2 === 1 ? "bg-slate-50/30" : "";
                tableHtml += `<tr class="${rowClass}">`;
                cells.forEach(c => {
                    tableHtml += `<td class="border border-slate-200 p-3">${formatInlineBullets(c)}</td>`;
                });
                tableHtml += "</tr>";
                rowCount++;
            }
        } else if (/^[-*+]\s+/.test(line)) {
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
            if (!inList) {
                inList = true;
                listHtml = '<ul class="list-disc pl-5 my-4 space-y-1.5">';
            }
            const itemText = line.replace(/^[-*+]\s+/, "");
            listHtml += `<li>${formatInlineBullets(itemText)}</li>`;
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
            if (inList) {
                inList = false;
                listHtml += '</ul>';
                result.push(listHtml);
                listHtml = "";
            }
            result.push(formatInlineBullets(lines[i]));
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
    if (inList) {
        listHtml += '</ul>';
        result.push(listHtml);
    }
    
    const finalHtml = result.join("\n");
    return hasWrapper ? `<div class="${wrapperClass}">${finalHtml}</div>` : finalHtml;
};

const InlinePassage = memo(({ passage, questions, answers, onAnswerChange, submitted, result, offset, clickedOption, setClickedOption, className = "leading-relaxed text-slate-700" }) => {
    const containerRef = useRef(null);

    const questionsKey = useMemo(() => questions.map(q => q.id).join(","), [questions]);
    const resultKey = useMemo(() => result ? JSON.stringify(result.evaluatedAnswers?.map(a => `${a.questionId}:${a.isCorrect}`)) : "", [result]);

    const processedPassage = useMemo(() => {
        const text = convertMarkdownTablesToHtml(collapseListeningExampleBlocks(passage));
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
            const isDragDrop = q.type === 'drag-drop-completion';

            if (isDragDrop) {
                if (submitted) {
                    let borderClass = isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700";
                    let badge = isCorrect
                        ? `<span class="badge badge-success text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✓</span>`
                        : `<span class="badge badge-error text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✗</span>`;
                    let correctAnswerHtml = !isCorrect 
                        ? `<span class="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-0.5 ml-1.5 flex-shrink-0 align-middle">✓ ${q.correctAnswer}</span>`
                        : "";
                    const titleAttr = !isCorrect ? `Correct Answer: ${q.correctAnswer}` : "";
                    
                    return `
                        <span class="inline-flex items-center gap-1 mx-1.5 relative group align-baseline">
                            <span 
                                class="inline-flex items-center justify-center min-w-[130px] h-9 px-3 border-2 rounded-xl text-xs font-black align-middle ${borderClass}"
                                data-q-id="${qId}"
                                title="${titleAttr}"
                            >
                                (${labelNum}) ${answers[qId] || "No Answer"}
                            </span>
                            ${badge}
                            ${correctAnswerHtml}
                        </span>
                    `.trim();
                } else {
                    return `
                        <span 
                            class="drag-drop-target inline-flex items-center justify-center min-w-[130px] h-9 px-3 border-2 border-dashed border-slate-400 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 hover:border-primary/40 cursor-pointer select-none transition-all text-xs font-bold text-slate-500 align-middle mx-1.5"
                            data-q-id="${qId}"
                            data-q-num="${labelNum}"
                        >
                            (${labelNum}) Drop here
                        </span>
                    `.trim();
                }
            }

            let inputClass = "inline-block px-3 py-1 text-sm font-bold bg-white border-2 border-slate-400 rounded-lg outline-none transition-all text-center focus:ring-2 focus:ring-primary/20 w-36";
            if (isMockTest) {
                inputClass = "inline-block h-10 px-3 py-1 rounded-xl w-36 font-bold border border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-center outline-none bg-white transition-all";
            } else if (submitted) {
                inputClass += isCorrect
                    ? " border-emerald-400 bg-emerald-50 text-emerald-700"
                    : " border-red-400 bg-red-50 text-red-700";
            } else {
                inputClass += " border-slate-400 focus:border-primary hover:border-slate-500";
            }

            let badgeHtml = "";
            if (!isMockTest && submitted) {
                badgeHtml = isCorrect
                    ? `<span class="badge badge-success text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✓</span>`
                    : `<span class="badge badge-error text-[10px] text-white font-bold p-1 rounded-full w-5 h-5 inline-flex items-center justify-center ml-1">✗</span>`;
            }

            let correctAnswerHtml = "";
            if (!isMockTest && submitted && !isCorrect) {
                correctAnswerHtml = `<span class="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-0.5 ml-1.5 flex-shrink-0 align-middle">✓ ${q.correctAnswer}</span>`;
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
                    ${correctAnswerHtml}
                </span>
            `.trim();
        });
    }, [passage, questionsKey, submitted, resultKey, offset]);

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

            const targets = containerRef.current.querySelectorAll('.drag-drop-target[data-q-id]');
            targets.forEach(target => {
                const qId = target.getAttribute('data-q-id');
                const qNum = target.getAttribute('data-q-num');
                const value = answers[qId] || "";
                if (value) {
                    target.innerHTML = `(${qNum}) <span class="text-slate-800 font-black mx-1 font-sans">${value}</span> <button class="clear-btn text-slate-400 hover:text-error ml-1.5 text-sm font-black" data-q-id="${qId}">×</button>`;
                    target.classList.remove('border-dashed', 'text-slate-500', 'bg-slate-50/50');
                    target.classList.add('border-solid', 'border-primary', 'bg-white');
                } else {
                    target.innerHTML = `(${qNum}) Drop here`;
                    target.classList.remove('border-solid', 'border-primary', 'bg-white');
                    target.classList.add('border-dashed', 'text-slate-500', 'bg-slate-50/50');
                }
            });
        }
    }, [answers, processedPassage]);

    const onAnswerChangeRef = useRef(onAnswerChange);
    const clickedOptionRef = useRef(clickedOption);
    const setClickedOptionRef = useRef(setClickedOption);

    useEffect(() => {
        onAnswerChangeRef.current = onAnswerChange;
        clickedOptionRef.current = clickedOption;
        setClickedOptionRef.current = setClickedOption;
    }, [onAnswerChange, clickedOption, setClickedOption]);

    useEffect(() => {
        const handleInput = (e) => {
            if (e.target && e.target.hasAttribute('data-q-id') && e.target.tagName === 'INPUT') {
                const qId = e.target.getAttribute('data-q-id');
                onAnswerChangeRef.current(qId, e.target.value);
            }
        };

        const handleDragOver = (e) => {
            const target = e.target.closest('.drag-drop-target');
            if (target) {
                e.preventDefault();
            }
        };

        const handleDrop = (e) => {
            const target = e.target.closest('.drag-drop-target');
            if (target) {
                e.preventDefault();
                const qId = target.getAttribute('data-q-id');
                const val = e.dataTransfer.getData("text/plain");
                if (qId && val) {
                    onAnswerChangeRef.current(qId, val);
                }
            }
        };

        const handleClick = (e) => {
            const clearBtn = e.target.closest('.clear-btn');
            if (clearBtn) {
                e.stopPropagation();
                e.preventDefault();
                const qId = clearBtn.getAttribute('data-q-id');
                if (qId) {
                    onAnswerChangeRef.current(qId, "");
                }
                return;
            }

            const target = e.target.closest('.drag-drop-target');
            if (target) {
                const qId = target.getAttribute('data-q-id');
                if (qId && clickedOptionRef.current) {
                    onAnswerChangeRef.current(qId, clickedOptionRef.current);
                    if (setClickedOptionRef.current) {
                        setClickedOptionRef.current(null);
                    }
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('input', handleInput);
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
            container.addEventListener('click', handleClick);
        }
        return () => {
            if (container) {
                container.removeEventListener('input', handleInput);
                container.removeEventListener('dragover', handleDragOver);
                container.removeEventListener('drop', handleDrop);
                container.removeEventListener('click', handleClick);
            }
        };
    }, []);

    const dangerouslySetHtml = useMemo(() => ({ __html: processedPassage }), [processedPassage]);

    return (
        <div 
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={dangerouslySetHtml}
        />
    );
});


const MatchingGridRenderer = ({ questions, options, answers, onAnswerChange, offset, data }) => {
    return (
        <div className="overflow-x-auto my-6 border border-base-200 rounded-3xl bg-white p-6 shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                        <th className="p-4 font-black text-xs uppercase tracking-widest text-slate-500">
                            Question
                        </th>
                        {options.map((opt, i) => (
                            <th key={i} className="p-4 text-center font-black text-xs uppercase tracking-widest text-slate-600">
                                {opt}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => {
                        const idx = data.questions.findIndex(item => item.id === q.id);
                        const selectedVal = answers[q.id] || "";
                        
                        return (
                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors" id={`question-${idx}`}>
                                <td className="p-4 font-semibold text-slate-700 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs flex-shrink-0">
                                        {offset + idx + 1}
                                    </div>
                                    <span>{q.question}</span>
                                </td>
                                {options.map((opt, optIdx) => {
                                    const isSelected = selectedVal === opt;
                                    return (
                                        <td key={optIdx} className="p-4 text-center align-middle">
                                            <input
                                                type="radio"
                                                name={q.id}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => onAnswerChange(q.id, opt)}
                                                className="radio radio-primary radio-sm cursor-pointer mx-auto transition-transform hover:scale-110"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const groupQuestions = (questions) => {
    const groups = [];
    let currentGridGroup = null;

    for (const q of questions) {
        if (q.type === 'matching-grid') {
            if (currentGridGroup) {
                currentGridGroup.questions.push(q);
            } else {
                currentGridGroup = {
                    type: 'matching-grid-group',
                    options: (q.options || []).filter(o => o && o.trim() !== ""),
                    questions: [q]
                };
                groups.push(currentGridGroup);
            }
        } else {
            currentGridGroup = null;
            groups.push({
                type: 'single',
                question: q
            });
        }
    }
    return groups;
};

const ReferenceMediaRenderer = ({ url }) => {
    const [isImage, setIsImage] = useState(true);

    if (!url) return null;

    return (
        <div className="group relative rounded-3xl border border-base-200 bg-base-50 p-4 transition-all hover:shadow-md max-w-2xl mx-auto w-full space-y-3 mb-6">
            {isImage ? (
                <div className="relative overflow-hidden rounded-2xl bg-white">
                    <img 
                        src={url} 
                        alt="Reference Map or Diagram" 
                        className="w-full h-auto max-h-[420px] object-contain mx-auto" 
                        onError={() => setIsImage(false)}
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-circle btn-primary shadow-lg"
                            title="Open in new tab"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </a>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M7.5 12h9m-9 3.75h9m-9-7.5h3" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-800">Reference Document / Map Link</h4>
                        <p className="text-xs text-slate-500 max-w-sm">Admins have provided a reference link for this section. Click below to open it.</p>
                    </div>
                </div>
            )}
            <div className="flex justify-center pt-1">
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {isImage ? "Open Map / Diagram in new window" : "Open Reference Link"}
                </a>
            </div>
        </div>
    );
};

const groupVisualsByQuestionGroups = (visualGroups, questionGroups, offset, questions) => {
    const grouped = [];
    const assignedVisuals = new Set();
    const sortedGroups = [...(questionGroups || [])].sort((a, b) => Number(a.fromQuestion) - Number(b.fromQuestion));

    for (const qg of sortedGroups) {
        const fromQ = Number(qg.fromQuestion);
        const toQ = Number(qg.toQuestion);
        const groupVisuals = [];

        for (let i = 0; i < visualGroups.length; i++) {
            if (assignedVisuals.has(i)) continue;

            const vg = visualGroups[i];
            const firstQ = vg.type === 'matching-grid-group' ? vg.questions[0] : vg.question;
            const firstQIdx = questions.findIndex(item => item.id === firstQ.id);
            const globalQNum = offset + firstQIdx + 1;

            if (globalQNum >= fromQ && globalQNum <= toQ) {
                groupVisuals.push(vg);
                assignedVisuals.add(i);
            }
        }

        if (groupVisuals.length > 0) {
            grouped.push({
                type: 'group',
                header: qg,
                visuals: groupVisuals
            });
        }
    }

    const ungroupedVisuals = [];
    for (let i = 0; i < visualGroups.length; i++) {
        if (!assignedVisuals.has(i)) {
            ungroupedVisuals.push(visualGroups[i]);
        }
    }

    if (ungroupedVisuals.length > 0) {
        grouped.push({
            type: 'ungrouped',
            visuals: ungroupedVisuals
        });
    }

    return grouped;
};

const GroupedContainer = ({ header, children }) => {
    return (
        <div className="card p-8 rounded-[3rem] border border-slate-200 bg-slate-50/20 space-y-6 shadow-xs w-full">
            {header && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary px-5 py-3 rounded-r-2xl">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-primary">
                                Questions {header.fromQuestion}–{header.toQuestion}
                            </span>
                            {header.title && (
                                <span className="font-bold text-sm text-slate-700">· {header.title}</span>
                            )}
                        </div>
                        {header.linkUrl && (
                            <a 
                                href={header.linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline bg-white border border-primary/20 px-3 py-1.5 rounded-xl shadow-xs"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                                Reference Link
                            </a>
                        )}
                    </div>
                    {header.instructions && (
                        <div className="bg-amber-50 border border-amber-200/60 px-5 py-3.5 rounded-2xl text-sm text-slate-700 leading-relaxed shadow-xs">
                            {header.instructions}
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
};

const QuestionRenderer = ({ q, idx, answers, onAnswerChange, clickedOption, setClickedOption }) => {
    return (
        <div className="space-y-4">
            {q.type === 'true-false' && (
                <div className="flex flex-wrap gap-2">
                    {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                        <button 
                            key={opt}
                            type="button"
                            onClick={() => onAnswerChange(q.id, opt)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                answers[q.id] === opt 
                                ? "bg-primary border-primary text-white" 
                                : "bg-white border-base-200 hover:border-primary/40"
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {q.type === 'multiple-choice' && (
                <div className="space-y-2">
                    {q.options?.filter(opt => opt && opt.trim() !== "").map((opt, optIdx) => (
                        <button 
                            key={optIdx}
                            type="button"
                            onClick={() => onAnswerChange(q.id, opt)}
                            className={`w-full text-left px-5 py-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-3 ${
                                answers[q.id] === opt 
                                ? "bg-primary border-primary text-white" 
                                : "bg-white border-base-200 hover:border-primary/40"
                            }`}
                        >
                            <span className="w-6 h-6 rounded bg-base-200 text-base-content/40 flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + optIdx)}
                            </span>
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {(q.type === 'matching' || q.type === 'heading-matching') && (
                <div>
                    <select
                        value={answers[q.id] || ""}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        className="select select-bordered border-slate-400 w-full rounded-xl font-bold bg-white focus:border-primary text-xs h-10 text-slate-800"
                    >
                        <option value="">— Select a match —</option>
                        {((q.options?.length && q.options.some(opt => opt && opt.trim() !== ""))
                            ? q.options.filter(opt => opt && opt.trim() !== "")
                            : (q.matchingPairs || []).map((p) => p.value).filter(Boolean)
                        ).map((opt, optIdx) => (
                            <option key={optIdx} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {q.type === 'drag-drop-completion' && (
                <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const val = e.dataTransfer.getData("text/plain");
                        if (val) onAnswerChange(q.id, val);
                    }}
                    className="flex items-center justify-center gap-2"
                >
                    <span className="text-xs font-bold text-slate-500">Answer:</span>
                    <div 
                        onClick={() => {
                            if (clickedOption) {
                                onAnswerChange(q.id, clickedOption);
                                if (setClickedOption) setClickedOption(null);
                            }
                        }}
                        className={`min-w-36 h-10 px-4 border-2 border-dashed rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer bg-slate-50/50 ${
                            answers[q.id]
                            ? "border-primary text-slate-800 bg-white font-black"
                            : "border-slate-300 text-slate-400 hover:border-primary/40"
                        }`}
                    >
                        {answers[q.id] || "Drop answer here"}
                        {answers[q.id] && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAnswerChange(q.id, "");
                                }}
                                className="ml-2 text-slate-400 hover:text-error text-sm font-black"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            )}

            {!(q.type === 'true-false' || q.type === 'multiple-choice' || q.type === 'matching' || q.type === 'heading-matching' || q.type === 'drag-drop-completion') && (
                <div>
                    <input 
                        type="text" 
                        className="input input-bordered border-slate-400 w-full rounded-xl font-bold bg-white focus:border-primary text-xs h-10 text-slate-800"
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ""}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

const GroupedQuestionsRenderer = ({ groupedItems, answers, onAnswerChange, offset, data, clickedOption, setClickedOption }) => {
    return (
        <div className="space-y-8">
            {groupedItems.map((groupEntry, geIdx) => {
                const isGroup = groupEntry.type === 'group';
                
                const children = groupEntry.visuals.map((vg, vgIdx) => {
                    if (vg.type === 'matching-grid-group') {
                        return (
                            <div key={`grid-${geIdx}-${vgIdx}`} className="space-y-4 p-6 rounded-3xl border border-base-200 bg-white shadow-xs">
                                <h3 className="text-lg font-black uppercase tracking-widest text-primary/40 pl-2">
                                    Matching Grid
                                </h3>
                                <MatchingGridRenderer
                                    questions={vg.questions}
                                    options={vg.options}
                                    answers={answers}
                                    onAnswerChange={onAnswerChange}
                                    offset={offset}
                                    data={data}
                                />
                            </div>
                        );
                    }

                    const q = vg.question;
                    const idx = data.questions.findIndex(item => item.id === q.id);
                    const isFlowChart = q.type === 'flow-chart-completion';
                    const nextIsFlowChart = vgIdx < groupEntry.visuals.length - 1 && groupEntry.visuals[vgIdx + 1]?.question?.type === 'flow-chart-completion';

                    return (
                        <div key={q.id || idx} className="space-y-4">
                            <div 
                                id={`question-${idx}`}
                                className={`p-6 rounded-3xl border transition-all scroll-mt-6 ${
                                    isFlowChart 
                                    ? "bg-slate-50/50 border-dashed border-slate-300 max-w-lg mx-auto text-center shadow-xs" 
                                    : "border-base-200 bg-white hover:border-primary/30"
                                }`}
                            >
                                <div className={`flex items-start gap-4 ${isFlowChart ? "flex-col items-center text-center" : ""}`}>
                                    <div className="flex-none w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                        {offset + idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <p className="text-lg font-semibold leading-snug">
                                            {q.question}
                                        </p>
                                        
                                        <QuestionRenderer
                                            q={q}
                                            idx={idx}
                                            answers={answers}
                                            onAnswerChange={onAnswerChange}
                                            clickedOption={clickedOption}
                                            setClickedOption={setClickedOption}
                                        />
                                    </div>
                                </div>
                            </div>
                            {isFlowChart && nextIsFlowChart && (
                                <div className="flex justify-center my-3 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 animate-bounce">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                });

                if (isGroup) {
                    return (
                        <GroupedContainer key={`group-${geIdx}`} header={groupEntry.header}>
                            {children}
                        </GroupedContainer>
                    );
                }

                return (
                    <div key={`ungrouped-${geIdx}`} className="space-y-8">
                        {children}
                    </div>
                );
            })}
        </div>
    );
};

const ListeningSection = ({ data, answers, onAnswerChange }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [clickedOption, setClickedOption] = useState(null);

    const passage = data?.passage;
    const questions = data?.questions;

    const dragDropQuestions = useMemo(() => questions?.filter(q => q.type === 'drag-drop-completion') || [], [questions]);
    const sharedOptions = useMemo(() => {
        const first = dragDropQuestions[0];
        return first?.options?.filter(Boolean) || [];
    }, [dragDropQuestions]);
    const offset = ((data?.listeningPart || 1) - 1) * 10;

    const renderedInlineIds = useMemo(() => {
        if (!passage) return new Set();
        const matches = passage.match(/___([\w-]+)___/g) || [];
        const ids = new Set();
        
        matches.forEach(m => {
            const matchKey = m.replace(/___/g, "").trim();
            const q = questions?.find((item, idx) => {
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
    }, [passage, questions, offset]);

    const remainingQuestions = useMemo(() => {
        return questions?.filter(q => !renderedInlineIds.has(q.id)) || [];
    }, [questions, renderedInlineIds]);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const formatAudioTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                                    className="btn btn-primary btn-circle btn-lg shadow-lg shadow-primary/20 flex-shrink-0"
                                >
                                    {isPlaying ? <PiPauseCircle className="w-8 h-8" /> : <PiPlayCircle className="w-8 h-8" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-bold text-lg">Control Board</h2>
                                    <p className="text-xs text-base-content/50 font-medium">Click play to begin. You will hear the recording only ONCE.</p>
                                </div>
                            </div>

                            {/* Progress Bar & Time */}
                            <div className="space-y-2 pt-2">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime}
                                    onChange={handleProgressChange}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                                    <span>{formatAudioTime(currentTime)}</span>
                                    <span>{formatAudioTime(duration)}</span>
                                </div>
                            </div>
                            
                            <audio 
                                ref={audioRef} 
                                src={data?.audioUrl} 
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
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

                    {/* ── Reference Media ─────────────────────────────── */}
                    {data?.images?.[0] && (
                        <ReferenceMediaRenderer url={data.images[0]} />
                    )}

                    {/* ── Passage (HTML with Inline Inputs) ── */}
                    {data?.passage && data.passage.trim() !== "" && (
                        <div className="p-8 rounded-[2rem] border border-base-200 bg-white shadow-xs prose prose-sm max-w-none">
                            <InlinePassage
                                passage={data.passage}
                                questions={data.questions || EMPTY_ARRAY}
                                answers={answers}
                                onAnswerChange={onAnswerChange}
                                offset={offset}
                                clickedOption={clickedOption}
                                setClickedOption={setClickedOption}
                            />
                        </div>
                    )}

                    {remainingQuestions.length > 0 && (() => {
                        const groups = groupQuestions(remainingQuestions);
                        const groupedItems = groupVisualsByQuestionGroups(groups, data.questionGroups, offset, data.questions);
                        return (
                            <GroupedQuestionsRenderer
                                groupedItems={groupedItems}
                                answers={answers}
                                onAnswerChange={onAnswerChange}
                                offset={offset}
                                data={data}
                                clickedOption={clickedOption}
                                setClickedOption={setClickedOption}
                            />
                        );
                    })()}

                    {sharedOptions.length > 0 && (
                        <div className="sticky bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 p-4 shadow-xl z-20 space-y-2 rounded-t-3xl mt-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                                Drag and drop or click to select an option to fill each blank
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {sharedOptions.map((opt, i) => {
                                    const letter = String.fromCharCode(65 + i);
                                    const label = `${letter}. ${opt}`;
                                    // Check if this option is already placed in answers
                                    const isPlaced = Object.values(answers).some(val => val === label || val === opt || val === `${letter}. ${opt}`);
                                    const isSelected = clickedOption === label;
                                    return (
                                        <div
                                            key={i}
                                            draggable={!isPlaced}
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData("text/plain", label);
                                            }}
                                            onClick={() => {
                                                if (!isPlaced) {
                                                    setClickedOption(isSelected ? null : label);
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-2xl text-xs font-bold border-2 transition-all cursor-pointer select-none ${
                                                isPlaced
                                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                                                    : isSelected
                                                    ? "bg-primary border-primary text-white shadow-lg scale-105"
                                                    : "bg-white border-slate-200 hover:border-primary/50 text-slate-700 hover:scale-105 active:scale-95"
                                            }`}
                                        >
                                            {label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListeningSection;
