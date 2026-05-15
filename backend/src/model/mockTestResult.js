import mongoose from 'mongoose';

const mockTestResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true
    },
    sectionResults: [{
        sectionType: {
            type: String,
            enum: ['reading', 'listening', 'writing', 'speaking']
        },
        answers: [{
            questionId: String,
            userAnswer: String,
            isCorrect: Boolean,
            correctAnswer: String
        }],
        score: Number,
        isGraded: {
            type: Boolean,
            default: false
        },
        timeTaken: Number, // in seconds
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tabSwitchCount: {
        type: Number,
        default: 0
    },
    fullscreenExits: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'auto-submitted'],
        default: 'ongoing'
    }
}, { timestamps: true });

const MockTestResult = mongoose.model('MockTestResult', mockTestResultSchema);
export default MockTestResult;
