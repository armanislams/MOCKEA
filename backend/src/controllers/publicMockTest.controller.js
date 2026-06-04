import Questions from '../model/questions.js';

// GET /api/public-mock-tests
// Returns all public speaking & listening question sets for guest users
export const getPublicMockTests = async (req, res) => {
    try {
        const tests = await Questions.find({
            isPublic: true,
            isMockOnly: { $ne: true },
            testType: { $in: ['speaking', 'listening'] }
        })
        .select('title testType instructions speakingPrompt audioUrl forPlanType')
        .lean();

        res.status(200).json({ success: true, tests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/public-mock-tests/:id
// Returns a single public question set with all questions
export const getPublicMockTestById = async (req, res) => {
    try {
        const test = await Questions.findOne({
            _id: req.params.id,
            isPublic: true,
            testType: { $in: ['speaking', 'listening'] }
        }).lean();

        if (!test) return res.status(404).json({ success: false, message: 'Public test not found' });

        res.status(200).json({ success: true, test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
