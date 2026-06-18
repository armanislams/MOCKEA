import { PiBookOpen } from "react-icons/pi";

export default function ListeningInlineGuide({ listeningPart }) {
    return (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl space-y-4 shadow-sm animate-fadeSlideDown">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-2xl">
                    <PiBookOpen className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">
                        How to Create IELTS Listening Part {listeningPart} (Inline &amp; Table Completion)
                    </h4>
                    <p className="text-xs text-slate-500">
                        Follow these steps to set up inline question gaps or markdown tables for the passage.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                        1
                    </div>
                    <h5 className="font-bold text-slate-700">Add Questions Below</h5>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Click <strong className="text-slate-700">+ Add Question</strong> below. Choose <strong className="text-slate-700">Short Answer / Note Completion</strong> as the type.
                    </p>
                </div>

                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                        2
                    </div>
                    <h5 className="font-bold text-slate-700">Insert Placeholders</h5>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        In the text box below, write your passage. Mark input blanks with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px] text-blue-600 font-bold">___31___</code> matching the question number.
                    </p>
                </div>

                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                        3
                    </div>
                    <h5 className="font-bold text-slate-700">Add Tables (Markdown)</h5>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Admins can add tables by typing columns separated by <code>|</code> characters. The student UI renders them beautifully.
                    </p>
                </div>

                <div className="p-4 bg-white/85 rounded-2xl border border-blue-50/50 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[10px]">
                        4
                    </div>
                    <h5 className="font-bold text-slate-700">Inline Student View</h5>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        The student UI automatically renders text boxes directly inside the passage text and table cells.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] space-y-2 overflow-x-auto border border-slate-800">
                    <div className="text-slate-400 border-b border-slate-800 pb-1.5 font-sans font-bold flex justify-between items-center">
                        <span>IELTS Table Completion Template</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono font-normal">Best for Parts 1 &amp; 4</span>
                    </div>
                    <div className="whitespace-pre">
{`| GROUP TOUR | DETAILS |
|---|---|
| Beachcombers and Rock - ___l12___ | exploring rock pools away from the |
| | ___l13___ |
| Guided Forest walk | to catch lunch |
| Beach Expedition | departs at ___l14___ |
| Moonlight Forest Walk | departs at sundown |
| the ___l15___ | |`}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] space-y-2 overflow-x-auto border border-slate-800">
                    <div className="text-slate-400 border-b border-slate-800 pb-1.5 font-sans font-bold flex justify-between items-center">
                        <span>Inline Passage Template</span>
                        <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded font-mono font-normal">Best for Parts 2 &amp; 3</span>
                    </div>
                    <div className="whitespace-pre">
{`The speaker explains that ___31___ is the
main advantage. Participants should arrive
at the ___32___ entrance by 9:30am. The
session includes a tour of the ___33___
and ends with lunch at the ___34___.`}
                    </div>
                </div>
            </div>
        </div>
    );
}
