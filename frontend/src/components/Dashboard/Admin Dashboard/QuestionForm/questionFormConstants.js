import {
    PiBookOpen,
    PiEar,
    PiPencilLine,
    PiMicrophoneStage,
    PiListBullets,
    PiTextT,
    PiArrowsLeftRight,
    PiMapTrifold,
} from "react-icons/pi";

export const TEST_SECTIONS = [
    { id: "reading",   label: "Reading",   icon: PiBookOpen,        color: "text-blue-500"   },
    { id: "listening", label: "Listening", icon: PiEar,             color: "text-purple-500" },
    { id: "writing",   label: "Writing",   icon: PiPencilLine,      color: "text-orange-500" },
    { id: "speaking",  label: "Speaking",  icon: PiMicrophoneStage, color: "text-green-500"  },
];

// Grouped question types for the dropdown
export const QUESTION_TYPE_GROUPS = [
    {
        group: "Completion",
        icon: PiTextT,
        types: [
            { value: "short-answer",          label: "Short Answer / Note Completion" },
            { value: "sentence-completion",   label: "Sentence Completion" },
            { value: "summary-completion",    label: "Summary Completion" },
            { value: "table-completion",      label: "Table Completion" },
            { value: "flow-chart-completion", label: "Flow-chart Completion" },
            { value: "drag-drop-completion",   label: "Drag and Drop Completion" },
        ],
    },
    {
        group: "Selection",
        icon: PiListBullets,
        types: [
            { value: "multiple-choice", label: "Multiple Choice (MCQ)" },
            { value: "true-false",      label: "True / False / Not Given" },
            { value: "yes-no",          label: "Yes / No / Not Given" },
        ],
    },
    {
        group: "Matching",
        icon: PiArrowsLeftRight,
        types: [
            { value: "matching",         label: "Matching" },
            { value: "heading-matching", label: "Heading Matching" },
            { value: "matching-grid",    label: "Matching Grid" },
        ],
    },
    {
        group: "Visual / Map (IELTS)",
        icon: PiMapTrifold,
        types: [
            { value: "map-labelling",     label: "Map / Plan Labelling" },
            { value: "diagram-labelling", label: "Diagram Labelling" },
        ],
    },
];

// Which types need options array
export const NEEDS_OPTIONS = ["multiple-choice", "true-false", "yes-no", "matching-grid", "drag-drop-completion"];
// Which types need matchingPairs
export const NEEDS_PAIRS = ["matching", "heading-matching"];
// Which types need a per-question image URL
export const NEEDS_IMAGE = ["map-labelling", "diagram-labelling"];

// IELTS Listening Part definitions
export const LISTENING_PARTS = [
    { part: 1, label: "Part 1", context: "Social conversation (2 speakers)", hint: "Form / Note completion" },
    { part: 2, label: "Part 2", context: "Social monologue (1 speaker)",     hint: "MCQ / Matching / Map labelling" },
    { part: 3, label: "Part 3", context: "Academic discussion (2–4 speakers)", hint: "MCQ / Sentence completion" },
    { part: 4, label: "Part 4", context: "Academic lecture (1 speaker)",      hint: "Note / Summary / Table completion" },
];

// ─── Default question factory ─────────────────────────────────────────────────
let _qCounter = 0;
export const makeQuestion = (testType = "listening") => {
    _qCounter++;
    const prefix = testType === "listening" ? "l" : testType === "reading" ? "r" : "q";
    return {
        id: `${prefix}${_qCounter}`,
        type: "short-answer",
        question: "",
        correctAnswer: "",
        options: ["", ""],
        matchingPairs: [{ key: "", value: "" }],
        imageUrl: "",
        passageIndex: 0,
        info: "",
    };
};

// ─── Initial form state ───────────────────────────────────────────────────────
export const initialForm = (testType = "reading") => ({
    title: "",
    instructions: "",
    passage: "",
    passages: [{ title: "", content: "" }],
    questionGroups: [{ title: "", instructions: "", fromQuestion: 1, toQuestion: 13, passageIndex: 0, linkUrl: "", rightSideQuestion: false }],
    audioUrl: "",
    speakingPrompt: "",
    speakingPart1Questions: [""],
    speakingPart3Questions: [""],
    images: [],
    task1Prompt: "",
    task1Image: "",
    task2Prompt: "",
    exampleQuestion: "Destination:",
    exampleAnswer: "Harbour City",
    examType: "IELTS",
    listeningPart: 1,
    forPlanType: "free",
    isPublic: false,
    isMockOnly: false,
    questions: [makeQuestion(testType)],
});
