import MockTest from '../model/mockTest.js';
import MockTestResult from '../model/mockTestResult.js';
import User from '../model/user.js';
import { cache } from '../utils/cache.js';

// Get all mock tests (Library)
export const getAllMockTests = async (req, res) => {
    try {
        const email = req.decoded_email;
        let examPreference = "IELTS";
        let userRole = "student";
        let userPlan = "free";
        let userId = null;

        if (email) {
            const userObj = await User.findOne({ email });
            if (userObj) {
                userId = userObj._id;
                if (userObj.targetExam) {
                    examPreference = userObj.targetExam;
                }
                if (userObj.role) {
                    userRole = userObj.role;
                }
                if (userObj.plan) {
                    userPlan = userObj.plan;
                }
            }
        }

        // Enforce Free plan view block
        if (userRole !== "admin" && userRole !== "instructor" && userPlan === "free") {
            return res.status(200).json({ success: true, tests: [], todayMockTestTaken: false });
        }

        const filter = {};

        // Admins see ALL mock tests regardless of examType
        // Students see tests matching their preference, or legacy tests without examType
        if (userRole !== "admin") {
            if (examPreference === "IELTS") {
                filter.$or = [
                    { examType: { $in: ["IELTS", "BOTH"] } },
                    { examType: { $exists: false } },
                    { examType: null }
                ];
            } else if (examPreference === "PTE") {
                filter.$or = [
                    { examType: { $in: ["PTE", "BOTH"] } },
                    { examType: { $exists: false } },
                    { examType: null }
                ];
            }
            // BOTH: no filter — student sees everything
        }

        const tests = await MockTest.find(filter).populate('sections.reading sections.listening sections.writing sections.speaking');

        // Check if standard user took a test today
        let todayMockTestTaken = false;
        if (userRole !== "admin" && userRole !== "instructor" && userPlan === "standard" && userId) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            
            const testToday = await MockTestResult.findOne({
                userId,
                createdAt: { $gte: startOfToday }
            });
            if (testToday) {
                todayMockTestTaken = true;
            }
        }

        res.status(200).json({ success: true, tests, todayMockTestTaken });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single mock test by ID
export const getMockTestById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `mocktest:${id}`;

        let test = await cache.get(cacheKey);

        if (!test) {
            test = await MockTest.findById(id)
                .populate('sections.reading')
                .populate('sections.listening')
                .populate('sections.writing')
                .populate('sections.speaking');
            
            if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
            await cache.set(cacheKey, test, 3600); // Cache for 1 hour
        }

        res.status(200).json({ success: true, test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Start a test
export const startTest = async (req, res) => {
    try {
        const { testId } = req.body;
        const userObj = req.user;

        if (!userObj) {
            return res.status(404).json({ success: false, message: 'User not found in session' });
        }

        // Block admins and instructors
        if (userObj.role === 'admin' || userObj.role === 'instructor') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access Denied: Admins and Instructors are not permitted to take mock tests.' 
            });
        }

        if (userObj.plan === 'free') {
            return res.status(403).json({ 
                success: false, 
                message: 'Free tier users cannot access mock tests. Please upgrade your plan to Standard or Premium.' 
            });
        }

        if (userObj.plan === 'standard') {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const testToday = await MockTestResult.findOne({
                userId: userObj._id,
                createdAt: { $gte: startOfToday }
            });
            if (testToday) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access Denied: Standard plan users are limited to 1 mock test per day. Please upgrade to Premium for unlimited access.' 
                });
            }
        }

        const result = new MockTestResult({ userId: userObj._id, testId });
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

        const safeTabSwitches = Math.max(0, Number(tabSwitches) || 0);
        const safeFullscreenExits = Math.max(0, Number(fullscreenExits) || 0);
        if (safeTabSwitches > 0) result.tabSwitchCount += safeTabSwitches;
        if (safeFullscreenExits > 0) result.fullscreenExits += safeFullscreenExits;

        if (result.tabSwitchCount >= 3) {
            result.status = 'terminated';
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
        const { resultId, isTerminated } = req.body;
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
                    const hasCorrectAnswer = originalQ && originalQ.correctAnswer != null;
                    const isCorrect = hasCorrectAnswer && originalQ.correctAnswer.toLowerCase().trim() === (ans.userAnswer || '').toLowerCase().trim();
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

        if (isTerminated || result.status === 'terminated' || result.tabSwitchCount >= 3) {
            await MockTestResult.findByIdAndDelete(resultId);
            return res.status(200).json({ success: true, message: 'Test session discarded' });
        } else {
            result.status = 'completed';
            await result.save();
            res.status(200).json({ success: true, message: 'Test finalized' });
        }
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
        const { page, limit } = req.query;
        const total = await MockTestResult.countDocuments();

        res.set("X-Total-Count", total.toString());
        res.set("Access-Control-Expose-Headers", "X-Total-Count");

        let query = MockTestResult.find()
            .populate('userId', 'name email')
            .populate('testId', 'title')
            .sort({ createdAt: -1 });

        if (page || limit) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;
            query = query.skip(skip).limit(limitNum);

            const results = await query;
            return res.status(200).json({ 
                success: true, 
                results,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            });
        }

        const results = await query;
        res.status(200).json({ success: true, results, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const gradeSection = async (req, res) => {
    try {
        const { resultId, sectionType, score, feedback } = req.body;
        const result = await MockTestResult.findById(resultId);

        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

        const section = result.sectionResults.find(s => s.sectionType === sectionType);
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        const instructor = await User.findOne({ email: req.decoded_email });

        section.score = score;
        if (feedback !== undefined) {
            section.feedback = feedback;
        }
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
        const { title, description, planType, isPublic, totalDuration, sections } = req.body;
        const newTest = new MockTest({ title, description, planType, isPublic, totalDuration, sections });
        await newTest.save();
        res.status(201).json({ success: true, test: newTest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMockTest = async (req, res) => {
    try {
        const { title, description, planType, isPublic, totalDuration, sections } = req.body;
        const test = await MockTest.findByIdAndUpdate(
            req.params.id,
            { title, description, planType, isPublic, totalDuration, sections },
            { returnDocument: 'after' }
        );
        await cache.del(`mocktest:${req.params.id}`);
        res.status(200).json({ success: true, test });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMockTest = async (req, res) => {
    try {
        await MockTest.findByIdAndDelete(req.params.id);
        await cache.del(`mocktest:${req.params.id}`);
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMockResult = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await MockTestResult.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }
        res.status(200).json({ success: true, message: 'Mock test result deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
