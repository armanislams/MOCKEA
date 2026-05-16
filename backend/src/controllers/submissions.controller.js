import PracticeSubmission from '../model/practiceSubmission.js';
import User from '../model/user.js';

export const submitPractice = async (req, res) => {
    try {
        const { questionSetId, testType, title, content, userName, userEmail } = req.body;
        
        if (!req.decoded_email) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No email found in token' });
        }
        
        const user = await User.findOne({ email: req.decoded_email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in database' });
        }
        
        const userId = user._id;

        if (!questionSetId || !content) {
            return res.status(400).json({ success: false, message: 'Missing required submission data' });
        }

        const submission = new PracticeSubmission({
            userId,
            userName,
            userEmail,
            questionSetId,
            testType,
            title,
            content
        });

        await submission.save();

        res.status(201).json({ 
            success: true, 
            message: 'Submission received successfully', 
            submission 
        });
    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        if (!req.decoded_email) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No email found' });
        }

        const submissions = await PracticeSubmission.find({ userEmail: req.decoded_email }).sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            submissions 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSubmissions = async (req, res) => {
    try {
        const { status, testType } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (testType) filter.testType = testType;

        const submissions = await PracticeSubmission.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            submissions 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reviewSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, bandScore, feedback } = req.body;
        
        const instructor = await User.findOne({ email: req.decoded_email });
        const reviewedBy = instructor?._id;
        const reviewedByEmail = req.decoded_email;

        const submission = await PracticeSubmission.findByIdAndUpdate(
            id,
            {
                score,
                bandScore,
                feedback,
                status: 'reviewed',
                reviewedBy,
                reviewedByEmail,
                reviewedByName: instructor?.name || req.decoded_email.split('@')[0],
                reviewedAt: new Date(),
                // Clear locks
                lockedBy: null,
                lockedByEmail: null,
                lockExpiresAt: null
            },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Submission reviewed successfully', 
            submission 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const lockSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const instructor = await User.findOne({ email: req.decoded_email });
        
        const submission = await PracticeSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // Check if already locked by someone else
        if (submission.lockedBy && submission.lockedBy.toString() !== instructor._id.toString() && submission.lockExpiresAt > new Date()) {
            return res.status(409).json({ 
                success: false, 
                message: `This submission is currently being reviewed by ${submission.lockedByEmail}`,
                lockedByEmail: submission.lockedByEmail
            });
        }

        // Set lock for 1 hour
        submission.lockedBy = instructor._id;
        submission.lockedByEmail = req.decoded_email;
        submission.lockedByName = instructor.name || req.decoded_email.split('@')[0];
        submission.lockExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await submission.save();

        res.status(200).json({ 
            success: true, 
            message: 'Submission locked for review', 
            lockExpiresAt: submission.lockExpiresAt 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
