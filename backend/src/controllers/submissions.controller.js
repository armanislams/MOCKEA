import PracticeSubmission from '../model/practiceSubmission.js';

export const submitPractice = async (req, res) => {
    try {
        const { questionSetId, testType, title, content, userName, userEmail } = req.body;
        const userId = req.user._id;

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
        const reviewedBy = req.user._id;

        const submission = await PracticeSubmission.findByIdAndUpdate(
            id,
            {
                score,
                bandScore,
                feedback,
                status: 'reviewed',
                reviewedBy,
                reviewedAt: new Date()
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
