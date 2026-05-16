import MockTest from '../model/mockTest.js';
import MockTestResult from '../model/mockTestResult.js';

// Get all mock tests (Library)
export const getAllMockTests = async (req, res) => {
    try {
        const tests = await MockTest.find().populate('sections.reading sections.listening sections.writing sections.speaking');
        res.status(200).json({ success: true, tests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single mock test by ID
export const getMockTestById = async (req, res) => {
    try {
        const test = await MockTest.findById(req.params.id)
            .populate('sections.reading')
            .populate('sections.listening')
            .populate('sections.writing')
            .populate('sections.speaking');
        
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.status(200).json({ success: true, test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Start a test
export const startTest = async (req, res) => {
    try {
        const { testId } = req.body;
        const userId = req.user._id;

        const result = new MockTestResult({ userId, testId });
        await result.save();
        res.status(201).json({ success: true, resultId: result._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit a section result
export const submitSection = async (req, res) => {
    try {
        const { resultId, sectionType, answers, timeTaken } = req.body;
        const result = await MockTestResult.findById(resultId);
        
        if (!result) return res.status(404).json({ success: false, message: 'Result session not found' });

        if (result.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
            questionId: qId,
            userAnswer: val
        }));

        result.sectionResults.push({ 
            sectionType, 
            answers: formattedAnswers, 
            timeTaken,
            isGraded: false
        });
        
        await result.save();
        res.status(200).json({ success: true, message: 'Section submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Anti-cheat stats
export const updateCheatStats = async (req, res) => {
    try {
        const { resultId, tabSwitches, fullscreenExits } = req.body;
        const result = await MockTestResult.findById(resultId);

        if (!result) return res.status(404).json({ success: false, message: 'Result session not found' });

        if (result.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (tabSwitches) result.tabSwitchCount += tabSwitches;
        if (fullscreenExits) result.fullscreenExits += fullscreenExits;

        if (result.tabSwitchCount >= 3) {
            result.status = 'auto-submitted';
        }

        await result.save();
        res.status(200).json({ success: true, status: result.status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Finalize test & Auto-grade Reading/Listening
export const finalizeTest = async (req, res) => {
    try {
        const { resultId } = req.body;
        const result = await MockTestResult.findById(resultId).populate({
            path: 'testId',
            populate: { path: 'sections.reading sections.listening sections.writing sections.speaking' }
        });

        if (!result) return res.status(404).json({ success: false, message: 'Result session not found' });

        for (let section of result.sectionResults) {
            if (['reading', 'listening'].includes(section.sectionType)) {
                const questionSet = result.testId.sections[section.sectionType][0];
                if (!questionSet) continue;

                let correctCount = 0;
                section.answers = section.answers.map(ans => {
                    const originalQ = questionSet.questions.find(q => q.id === ans.questionId);
                    const isCorrect = originalQ && originalQ.correctAnswer.toLowerCase().trim() === ans.userAnswer.toLowerCase().trim();
                    if (isCorrect) correctCount++;
                    
                    return {
                        ...ans,
                        isCorrect,
                        correctAnswer: originalQ?.correctAnswer
                    };
                });

                section.score = correctCount;
                section.isGraded = true;
            }
        }

        result.status = 'completed';
        await result.save();
        res.status(200).json({ success: true, message: 'Test finalized' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get results for current user
export const getUserResults = async (req, res) => {
    try {
        const results = await MockTestResult.find({ userId: req.user._id })
            .populate('testId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single result details for review
export const getResultDetail = async (req, res) => {
    try {
        const result = await MockTestResult.findById(req.params.id)
            .populate({
                path: 'testId',
                populate: { path: 'sections.reading sections.listening sections.writing sections.speaking' }
            });

        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

        // Security: Ensure student only sees their own results
        if (req.user.role !== 'admin' && req.user.role !== 'instructor' && result.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        res.status(200).json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all results (For Instructors)
export const getAllResults = async (req, res) => {
    try {
        const results = await MockTestResult.find()
            .populate('userId', 'name email')
            .populate('testId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const gradeSection = async (req, res) => {
    try {
        const { resultId, sectionType, score } = req.body;
        const result = await MockTestResult.findById(resultId);

        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

        const section = result.sectionResults.find(s => s.sectionType === sectionType);
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        const instructor = await User.findOne({ email: req.decoded_email });

        section.score = score;
        section.isGraded = true;
        section.reviewedBy = instructor._id;
        section.reviewedByEmail = req.decoded_email;
        section.reviewedByName = instructor.name || req.decoded_email.split('@')[0];

        // Clear locks if this was the last section to grade (optional logic, but let's clear it anyway if explicitly graded)
        result.lockedBy = null;
        result.lockedByEmail = null;
        result.lockExpiresAt = null;

        await result.save();
        res.status(200).json({ success: true, message: 'Graded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const lockMockResult = async (req, res) => {
    try {
        const { id } = req.params;
        const instructor = await User.findOne({ email: req.decoded_email });
        
        const result = await MockTestResult.findById(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result session not found' });
        }

        // Check if already locked by someone else
        if (result.lockedBy && result.lockedBy.toString() !== instructor._id.toString() && result.lockExpiresAt > new Date()) {
            return res.status(409).json({ 
                success: false, 
                message: `This test is currently being reviewed by ${result.lockedByEmail}`,
                lockedByEmail: result.lockedByEmail
            });
        }

        // Set lock for 1 hour
        result.lockedBy = instructor._id;
        result.lockedByEmail = req.decoded_email;
        result.lockedByName = instructor.name || req.decoded_email.split('@')[0];
        result.lockExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await result.save();

        res.status(200).json({ 
            success: true, 
            message: 'Test locked for review', 
            lockExpiresAt: result.lockExpiresAt 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Mock Test CRUD
export const createMockTest = async (req, res) => {
    try {
        const newTest = new MockTest(req.body);
        await newTest.save();
        res.status(201).json({ success: true, test: newTest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMockTest = async (req, res) => {
    try {
        const test = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMockTest = async (req, res) => {
    try {
        await MockTest.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
