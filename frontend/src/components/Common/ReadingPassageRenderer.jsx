import React, { useMemo, useEffect, useRef, memo } from "react";
import { convertMarkdownContentToHtml } from "../../utils/markdownUtils.js";

/**
 * Renders the Reading passage content and dynamically replaces ___N___ placeholders
 * with interactive drag-and-drop zones or inline text inputs, binding them to React state.
 */
const ReadingPassageRenderer = memo(({
    passageContent,
    questions,
    answers,
    onAnswerChange,
    submitted,
    result,
    clickedOption,
    setClickedOption,
    className = "text-lg leading-relaxed text-slate-600 text-justify select-text",
    offset = 0
}) => {
    const containerRef = useRef(null);

    const questionsKey = useMemo(() => questions.map(q => q.id).join(","), [questions]);
    const resultKey = useMemo(() => result ? JSON.stringify(result.evaluatedAnswers?.map(a => `${a.questionId}:${a.isCorrect}`)) : "", [result]);

    const processedHtml = useMemo(() => {
        if (!passageContent) return "";
        let html = convertMarkdownContentToHtml(passageContent);

        const hasInlinePlaceholders = /___([\w-]+)___/.test(html);
        if (!hasInlinePlaceholders) {
            return html;
        }

        return html.replace(/___([\w-]+)___/g, (match, matchKey) => {
            // Find question in the entire set
            const q = questions.find((item, idx) => {
                const questionNum = (offset || 0) + idx + 1;
                const localIndex = idx + 1;
                return (
                    item.id === matchKey ||
                    questionNum.toString() === matchKey ||
                    localIndex.toString() === matchKey ||
                    item.id.replace(/^r/, "") === matchKey // Support matching "1" to "r1"
                );
            });
            if (!q) return match;

            const qIndexInSet = questions.indexOf(q);
            const labelNum = (offset || 0) + qIndexInSet + 1;
            const qId = q.id;

            const evaluation = result?.evaluatedAnswers?.find((a) => a.questionId === qId);
            const isCorrect = evaluation?.isCorrect;
            
            const isMockTest = submitted === undefined;
            const isDragDrop = q.type === 'drag-drop-completion';

            if (isDragDrop) {
                if (submitted) {
                    let borderClass = isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700";
                    let badge = isCorrect
                        ? `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold ml-1 flex-shrink-0">✓</span>`
                        : `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold ml-1 flex-shrink-0">✗</span>`;
                    let correctAnswerHtml = !isCorrect 
                        ? `<span class="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-0.5 ml-1.5 flex-shrink-0 align-middle">✓ ${q.correctAnswer}</span>`
                        : "";
                    const titleAttr = !isCorrect ? `Correct Answer: ${q.correctAnswer}` : "";
                    
                    return `
                        <span class="inline-flex items-center gap-1 mx-1.5 relative group align-baseline">
                            <span class="text-primary font-black mr-0.5 flex-shrink-0">(${labelNum})</span>
                            <span 
                                class="inline-flex items-center justify-center min-w-[130px] h-9 px-3 border-2 rounded-xl text-xs font-black align-middle ${borderClass}"
                                data-q-id="${qId}"
                                title="${titleAttr}"
                            >
                                ${answers[qId] || "No Answer"}
                            </span>
                            ${badge}
                            ${correctAnswerHtml}
                        </span>
                    `.trim();
                } else {
                    return `
                        <span class="inline-flex items-baseline mx-0.5 relative group align-baseline">
                            <span class="text-primary font-black mr-0.5 flex-shrink-0">(${labelNum})</span>
                            <span 
                                class="drag-drop-target inline-flex items-center justify-center min-w-[130px] h-9 px-3 border-2 border-dashed border-slate-400 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 hover:border-primary/40 cursor-pointer select-none transition-all text-xs font-bold text-slate-500 align-middle"
                                data-q-id="${qId}"
                                data-q-num="${labelNum}"
                            >
                                Drop here
                            </span>
                        </span>
                    `.trim();
                }
            }

            // Fallback: Inline text inputs
            let inputClass = "inline-flex items-baseline gap-0.5 text-sm font-bold bg-transparent outline-none transition-all";
            if (submitted) {
                inputClass += isCorrect
                    ? " text-emerald-700"
                    : " text-red-700";
            }

            let badgeHtml = "";
            if (!isMockTest && submitted) {
                badgeHtml = isCorrect
                    ? `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold ml-1 flex-shrink-0">✓</span>`
                    : `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold ml-1 flex-shrink-0">✗</span>`;
            }

            let correctAnswerHtml = "";
            if (!isMockTest && submitted && !isCorrect) {
                correctAnswerHtml = `<span class="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-0.5 ml-1.5 flex-shrink-0 align-middle">✓ ${q.correctAnswer}</span>`;
            }

            const titleAttr = (!isMockTest && submitted && !isCorrect) ? `Correct Answer: ${q.correctAnswer}` : "";

            return `
                <span class="inline-flex items-baseline mx-0.5 relative group align-baseline">
                    <span class="text-primary font-black mr-0.5 flex-shrink-0">(${labelNum})</span>
                    <input
                        type="text"
                        data-q-id="${qId}"
                        ${(!isMockTest && submitted) ? "disabled" : ""}
                        placeholder="________"
                        value=""
                        class="${inputClass} w-28 border-b-2 border-dashed border-slate-400 focus:border-primary pb-0.5 text-center placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm ${submitted ? (isCorrect ? "border-emerald-400" : "border-red-400") : ""}"
                        title="${titleAttr}"
                    />
                    ${badgeHtml}
                    ${correctAnswerHtml}
                </span>
            `.trim();
        });
    }, [passageContent, questionsKey, submitted, resultKey, offset]);

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
                const value = answers[qId] || "";
                if (value) {
                    target.innerHTML = `<span class="text-slate-800 font-black mx-1 font-sans">${value}</span> <button class="clear-btn text-slate-400 hover:text-error ml-1.5 text-sm font-black" data-q-id="${qId}">×</button>`;
                    target.classList.remove('border-dashed', 'text-slate-500', 'bg-slate-50/50');
                    target.classList.add('border-solid', 'border-primary', 'bg-white');
                } else {
                    target.innerHTML = `Drop here`;
                    target.classList.remove('border-solid', 'border-primary', 'bg-white');
                    target.classList.add('border-dashed', 'text-slate-500', 'bg-slate-50/50');
                }
            });
        }
    }, [answers, processedHtml]);

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

    return (
        <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
            className={className}
        />
    );
});

export default ReadingPassageRenderer;
