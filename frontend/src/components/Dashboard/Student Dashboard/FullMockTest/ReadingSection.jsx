import { useState, useRef, useEffect, useMemo } from "react";
import { PiNotePencil } from "react-icons/pi";

const ReadingSection = ({ data, answers, onAnswerChange }) => {
       const [toolbar, setToolbar] = useState({ show: false, x: 0, y: 0, range: null });
    const [activeNote, setActiveNote] = useState({ show: false, text: "", element: null, x: 0, y: 0 });
    const lastShownRef = useRef(0);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Hide selection toolbar if clicking away (outside both the toolbar and the passage container)
            if (toolbar.show && !e.target.closest("[data-highlight-toolbar]") && !e.target.closest("[data-passage-container]")) {
                setToolbar((prev) => ({ ...prev, show: false }));
            }
            // Close active sticky note editor if clicking away from it and from highlights
            if (activeNote.show && !e.target.closest("[data-note-popover]") && !e.target.closest("[data-highlight]")) {
                setActiveNote({ show: false, text: "", element: null, x: 0, y: 0 });
            }
        };

        document.addEventListener("pointerdown", handleGlobalClick);
        return () => document.removeEventListener("pointerdown", handleGlobalClick);
    }, [toolbar.show, activeNote.show]);

    const handleTextSelection = (e) => {
        const container = e.currentTarget;
        
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
                // If the toolbar was shown very recently (within 300ms), ignore the collapsed check
                // to prevent trackpad pointer-up bounces/micro-clicks from hiding the toolbar.
                if (Date.now() - lastShownRef.current < 300) {
                    return;
                }
                setToolbar((prev) => ({ ...prev, show: false }));
                return;
            }

            try {
                const range = selection.getRangeAt(0);
                if (!container.contains(range.commonAncestorContainer)) {
                    return;
                }

                const rect = range.getBoundingClientRect();
                setToolbar({
                    show: true,
                    x: rect.left + window.scrollX + rect.width / 2,
                    y: rect.top + window.scrollY - 45,
                    range: range.cloneRange()
                });
                lastShownRef.current = Date.now();
            } catch (err) {
                console.debug("Highlight range capture skipped:", err);
            }
        }, 80);
    };

    const applyHighlight = (colorClass) => {
        if (!toolbar.range) return;

        const span = document.createElement("mark");
        span.className = `${colorClass} text-slate-900 cursor-pointer rounded px-0.5 transition-all hover:opacity-90 relative`;
        span.setAttribute("data-highlight", "true");
        span.setAttribute("data-color", colorClass);
        span.setAttribute("data-note", "");

        // Set inline styles to completely bypass Tailwind/prose specificity overrides!
        if (colorClass.includes("bg-yellow-200")) {
            span.style.backgroundColor = "#fef08a"; // Yellow 200
        } else if (colorClass.includes("bg-emerald-200")) {
            span.style.backgroundColor = "#a7f3d0"; // Emerald 200
        } else if (colorClass.includes("bg-sky-200")) {
            span.style.backgroundColor = "#bae6fd"; // Sky 200
        } else if (colorClass.includes("bg-pink-200")) {
            span.style.backgroundColor = "#fbcfe8"; // Pink 200
        } else if (colorClass.includes("border-yellow-400")) {
            span.style.backgroundColor = "rgba(254, 240, 138, 0.5)"; // Yellow 100/50
            span.style.borderBottom = "2px solid #eab308"; // Yellow 500 border
        }

        span.onclick = (e) => {
            e.stopPropagation();
            openNoteModal(span);
        };

        try {
            toolbar.range.surroundContents(span);
        } catch (err) {
            console.warn("surroundContents failed, trying extractContents fallback:", err);
            try {
                const fragment = toolbar.range.extractContents();
                span.appendChild(fragment);
                toolbar.range.insertNode(span);
            } catch (innerErr) {
                console.error("Highlight extraction fallback failed:", innerErr);
            }
        }

        // Auto-open note editor if "Add Note" was clicked
        const isNote = colorClass.includes("border-yellow-400");
        if (isNote) {
            openNoteModal(span);
        }

        window.getSelection().removeAllRanges();
        setToolbar({ show: false, x: 0, y: 0, range: null });
    };

    const openNoteModal = (element) => {
        const rect = element.getBoundingClientRect();
        const noteText = element.getAttribute("data-note") || "";
        setActiveNote({
            show: true,
            text: noteText,
            element: element,
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY + rect.height + 10
        });
    };

    const removeHighlight = (element) => {
        if (!element) return;
        const parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
        setActiveNote({ show: false, text: "", element: null, x: 0, y: 0 });
    };

    const passageElement = useMemo(() => {
        return (
            <div 
                data-passage-container="true"
                onMouseUp={handleTextSelection}
                onPointerUp={handleTextSelection}
                className="prose prose-lg max-w-none prose-p:leading-relaxed prose-p:text-base-content/80 prose-headings:font-black font-serif text-xl space-y-6 select-text"
                dangerouslySetInnerHTML={{ __html: data?.passage || data?.sections?.[0]?.content || "No passage content available." }}
            />
        );
    }, [data]);

    return (
        <div className="flex h-full overflow-hidden bg-white">
            {/* Left Pane: Passage with Sticky Question Palette at the Bottom */}
            <div className="w-1/2 flex flex-col h-full border-r border-base-200">
                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <header className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Part 1</p>
                            <h1 className="text-4xl font-extrabold tracking-tight">{data?.passageTitle || data?.title}</h1>
                            <p className="text-base-content/60 italic leading-relaxed text-lg">
                                An exploration of the ancient origins and development of map-making, highlighting key innovations and their impact on navigation, exploration, and understanding of the world.
                            </p>
                        </header>

                        {passageElement}
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
                                        {i + 1}
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
                        <div className="flex items-center gap-2 text-primary">
                            <PiNotePencil className="w-6 h-6" />
                            <h2 className="text-xl font-black uppercase tracking-widest">Questions 1–{data?.questions?.length || 13}</h2>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-base-200 shadow-sm">
                            <h3 className="font-bold mb-2">Instructions:</h3>
                            <p className="text-sm text-base-content/70">
                                Do the following statements agree with the information given in Reading Passage 1? In boxes 1–{data?.questions?.length || 13} on your answer sheet, write:
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
                            <div key={q.id || idx} id={`question-${idx}`} className="space-y-4 scroll-mt-6">
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
                                        {q.options?.filter(opt => opt && opt.trim() !== "").map((opt, optIdx) => (
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
            {/* Floating Highlight Action Toolbar */}
            {toolbar.show && (
                <div 
                    data-highlight-toolbar="true"
                    className="absolute z-[100] flex items-center gap-2 p-2 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md -translate-x-1/2"
                    style={{ top: `${toolbar.y}px`, left: `${toolbar.x}px` }}
                >
                    <button 
                        onClick={() => applyHighlight("bg-yellow-200")}
                        className="w-6 h-6 rounded-full bg-yellow-200 hover:scale-110 active:scale-95 transition-transform border border-white/20"
                        title="Yellow"
                    />
                    <button 
                        onClick={() => applyHighlight("bg-emerald-200")}
                        className="w-6 h-6 rounded-full bg-emerald-200 hover:scale-110 active:scale-95 transition-transform border border-white/20"
                        title="Mint Green"
                    />
                    <button 
                        onClick={() => applyHighlight("bg-sky-200")}
                        className="w-6 h-6 rounded-full bg-sky-200 hover:scale-110 active:scale-95 transition-transform border border-white/20"
                        title="Soft Blue"
                    />
                    <button 
                        onClick={() => applyHighlight("bg-pink-200")}
                        className="w-6 h-6 rounded-full bg-pink-200 hover:scale-110 active:scale-95 transition-transform border border-white/20"
                        title="Rose Pink"
                    />
                    <div className="w-px h-5 bg-white/25 mx-1" />
                    <button 
                        onClick={() => applyHighlight("bg-yellow-100/50 border-b-2 border-yellow-400")}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 hover:bg-white/10 rounded-xl transition-all text-white/90"
                    >
                        <PiNotePencil className="w-4 h-4 text-yellow-300" /> Add Note
                    </button>
                </div>
            )}

            {/* Sticky Note Popover Editor */}
            {activeNote.show && (
                <div 
                    data-note-popover="true"
                    className="absolute z-[110] w-64 p-4 bg-white rounded-3xl shadow-2xl border border-base-200 -translate-x-1/2 flex flex-col gap-3"
                    style={{ 
                        top: `${activeNote.y}px`, 
                        left: `${activeNote.x}px` 
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            <PiNotePencil className="text-sm" /> Sticky Note
                        </span>
                        <button 
                            onClick={() => removeHighlight(activeNote.element)}
                            className="btn btn-ghost btn-xs text-error font-black uppercase text-[9px] tracking-wider hover:bg-error/10 rounded-lg"
                        >
                            Delete Note
                        </button>
                    </div>
                    <textarea
                        value={activeNote.text}
                        onChange={(e) => {
                            setActiveNote((prev) => ({ ...prev, text: e.target.value }));
                            activeNote.element.setAttribute("data-note", e.target.value);
                        }}
                        placeholder="Jot down a quick note..."
                        className="textarea textarea-bordered rounded-2xl w-full h-24 text-xs font-medium focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setActiveNote({ show: false, text: "", element: null, x: 0, y: 0 })}
                            className="btn btn-primary btn-sm rounded-xl text-[10px] font-black uppercase tracking-widest px-4 border-none shadow-md shadow-primary/20"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadingSection;
