import { PiPlus, PiTrash } from "react-icons/pi";
import { 
  QUESTION_TYPE_GROUPS, 
  NEEDS_OPTIONS, 
  NEEDS_PAIRS, 
  NEEDS_IMAGE 
} from "./questionFormConstants";

export const QuestionTypeSelect = ({ value, onChange }) => (
    <select
        className="select select-bordered w-full rounded-2xl text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    >
        {QUESTION_TYPE_GROUPS.map((g) => (
            <optgroup key={g.group} label={`── ${g.group} ──`}>
                {g.types.map((t) => (
                    <option key={t.value} value={t.value}>
                        {t.label}
                    </option>
                ))}
            </optgroup>
        ))}
    </select>
);

export const QuestionTypeExtras = ({ q, onUpdate, onAddOption, onUpdateOption, onRemoveOption, onAddPair, onUpdatePair }) => {
    if (NEEDS_OPTIONS.includes(q.type)) {
        return (
            <div className="bg-base-100 p-4 rounded-2xl space-y-3">
                {q.type === "matching-grid" && (
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text font-black text-[10px] uppercase tracking-widest text-base-content/50">Info / Passage Text (Legend)</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full rounded-xl text-xs font-semibold min-h-[5rem]"
                            placeholder="Enter paragraph descriptions or list options legend mapping (e.g. A. option A text, B. option B text...)"
                            value={q.info || ""}
                            onChange={(e) => onUpdate(q.id, "info", e.target.value)}
                        />
                    </div>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/50">
                    Options
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-1.5 w-full">
                            <input
                                type="text"
                                className="input input-bordered input-sm rounded-xl flex-1"
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                value={opt}
                                onChange={(e) => onUpdateOption(q.id, i, e.target.value)}
                            />
                            {q.options.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveOption && onRemoveOption(q.id, i)}
                                    className="btn btn-ghost btn-xs btn-circle text-error flex-shrink-0"
                                    title="Delete Option"
                                >
                                    <PiTrash className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => onAddOption(q.id)}
                        className="btn btn-ghost btn-xs text-primary gap-1 self-center md:col-span-2 justify-start pl-1"
                    >
                        <PiPlus /> Add Option
                    </button>
                </div>
            </div>
        );
    }

    if (NEEDS_PAIRS.includes(q.type)) {
        return (
            <div className="bg-base-100 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/50">
                    Matching Pairs
                </span>
                {q.matchingPairs.map((pair, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            className="input input-bordered input-sm rounded-xl"
                            placeholder={`Item ${i + 1}`}
                            value={pair.key}
                            onChange={(e) => onUpdatePair(q.id, i, "key", e.target.value)}
                        />
                        <input
                            type="text"
                            className="input input-bordered input-sm rounded-xl"
                            placeholder={`Match ${i + 1}`}
                            value={pair.value}
                            onChange={(e) => onUpdatePair(q.id, i, "value", e.target.value)}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => onAddPair(q.id)}
                    className="btn btn-ghost btn-xs text-primary gap-1"
                >
                    <PiPlus /> Add Pair
                </button>
            </div>
        );
    }

    if (NEEDS_IMAGE.includes(q.type)) {
        return (
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-semibold text-xs">
                        Map / Diagram Image URL (for this question)
                    </span>
                </label>
                <input
                    type="url"
                    className="input input-bordered rounded-2xl text-sm"
                    placeholder="https://domain.com/map.png"
                    value={q.imageUrl || ""}
                    onChange={(e) => onUpdate(q.id, "imageUrl", e.target.value)}
                />
            </div>
        );
    }

    return null;
};
