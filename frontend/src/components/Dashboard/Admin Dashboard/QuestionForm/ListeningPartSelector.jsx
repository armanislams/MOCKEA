import { PiEar } from "react-icons/pi";
import { LISTENING_PARTS } from "./questionFormConstants";

export default function ListeningPartSelector({ value, onChange }) {
    return (
        <div className="card bg-white border border-base-300 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <PiEar className="text-primary" /> IELTS Listening Part
            </h2>
            <p className="text-sm text-base-content/60">
                Each Part is a standalone 10-question set. The mock test bundler assembles Parts 1–4 into a full test.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LISTENING_PARTS.map((p) => (
                    <button
                        key={p.part}
                        type="button"
                        onClick={() => onChange(p.part)}
                        className={`flex flex-col gap-1.5 p-4 rounded-2xl border-2 text-left transition-all ${
                            value === p.part
                                ? "border-primary bg-primary/5"
                                : "border-base-300 bg-white hover:border-primary/40"
                        }`}
                    >
                        <span className={`text-xs font-black uppercase tracking-widest ${
                            value === p.part ? "text-primary" : "text-base-content/40"
                        }`}>
                            {p.label}
                        </span>
                        <span className="text-sm font-bold text-slate-700 leading-snug">
                            {p.context}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1">
                            {p.hint}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
