import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    planType: {
        type: String,
        enum: ['free', 'standard', 'premium'],
        default: 'free'
    },
    sections: {
        reading: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Questions'
        }],
        listening: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Questions'
        }],
        writing: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Questions'
        }],
        speaking: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Questions'
        }]
    },
    totalDuration: {
        type: Number, // in minutes
        required: true
    }
}, { timestamps: true });

const MockTest = mongoose.model('MockTest', mockTestSchema);
export default MockTest;
