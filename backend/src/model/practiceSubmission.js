import mongoose from 'mongoose';

const PracticeSubmissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        questionSetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Questions',
            required: true,
        },
        testType: {
            type: String,
            enum: ['writing', 'speaking'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String, // Text for writing, Audio URL for speaking
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed'],
            default: 'pending',
        },
        score: {
            type: Number,
        },
        bandScore: {
            type: String,
        },
        feedback: {
            type: String,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedByEmail: {
            type: String,
        },
        reviewedByName: {
            type: String,
        },
        reviewedAt: {
            type: Date,
        },
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lockedByEmail: {
            type: String,
        },
        lockedByName: {
            type: String,
        },
        lockExpiresAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

const PracticeSubmission = mongoose.model('PracticeSubmission', PracticeSubmissionSchema);
export default PracticeSubmission;
