import mongoose from "mongoose"

const readingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    readingId: {
        type: String,
        required: true
    },
    passage: {
        type: String,
        required: true
    },
    sections: [{
        title: String,
        content: String
    }],
    questions: [{
        id: String,
        type: {
            type: String,
            enum: ['short-answer']
        },
        question: String,
        options: [String],
        correctAnswer: String
    }],
    answers: [{
        questionId: String,
        userAnswer: String,
    }],
    score: Number,
    totalQuestions: Number,
    completedAt: Date
}, { timestamps: true });

const Reading = mongoose.model("Reading", readingSchema);
export default Reading;
