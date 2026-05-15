import mongoose from 'mongoose';

const QuestionItemSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "short-answer", 
                "multiple-choice", 
                "true-false", 
                "yes-no", 
                "matching", 
                "heading-matching", 
                "sentence-completion",
                "summary-completion",
                "diagram-labeling"
            ],
            default: "short-answer",
        },
        question: {
            type: String,
            required: true,
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            default: [],
        },
        // For matching types, we might need pairs
        matchingPairs: [{
            key: String,
            value: String
        }]
    },
    { _id: false },
);

const QuestionsSchema = new mongoose.Schema(
    {
        testType: {
            type: String,
            enum: ['reading', 'listening', 'writing', 'speaking'],
            required: true,
            default: 'reading'
        },
        title: {
            type: String,
            required: true,
        },
        // For Reading
        passage: {
            type: String,
        },
        // For Listening
        audioUrl: {
            type: String,
        },
        // For Writing/Speaking prompt images
        images: {
            type: [String],
            default: []
        },
        // Existing sections support
        sections: [
            {
                title: {
                    type: String,
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                },
            },
        ],
        // Grouping instructions (e.g., "Questions 1-5")
        instructions: {
            type: String
        },
        questions: [QuestionItemSchema],
        forPlanType: {
            type: String,
            default: "free",
        },
    },
    { timestamps: true },
);

const Questions = mongoose.model('Questions', QuestionsSchema);
export default Questions;