import { TEST_SECTIONS } from "./questionFormConstants";

export default function TestSectionPicker({ testType, setTestType, locked = false }) {
    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEST_SECTIONS.map((item) => {
                const isSelected = testType === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        disabled={locked}
                        onClick={() => !locked && setTestType(item.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${
                            isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-base-300 bg-white hover:border-primary/50"
                        } ${locked && isSelected ? "border-primary/50 bg-primary/5 cursor-not-allowed" : ""} ${locked && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <item.icon className={`w-8 h-8 ${isSelected ? "text-primary" : item.color}`} />
                        <span className="font-bold">{item.label}</span>
                    </button>
                );
            })}
        </section>
    );
}
