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

// Create a new Mock Test (Admin)
export const createMockTest = async (req, res) => {
    try {
        const newTest = new MockTest(req.body);
        await newTest.save();
        res.status(201).json({ success: true, test: newTest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Start a test (Initialize result)
export const startTest = async (req, res) => {
    try {
        const { testId, userId } = req.body;
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
        const { resultId, sectionType, answers, score, timeTaken } = req.body;
        const result = await MockTestResult.findById(resultId);
        
        if (!result) return res.status(404).json({ success: false, message: 'Result session not found' });

        result.sectionResults.push({ sectionType, answers, score, timeTaken });
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

        if (tabSwitches) result.tabSwitchCount += tabSwitches;
        if (fullscreenExits) result.fullscreenExits += fullscreenExits;

        // Auto-submit if tab switches >= 3
        if (result.tabSwitchCount >= 3) {
            result.status = 'auto-submitted';
        }

        await result.save();
        res.status(200).json({ success: true, status: result.status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Finalize test
export const finalizeTest = async (req, res) => {
    try {
        const { resultId } = req.body;
        const result = await MockTestResult.findById(resultId);
        result.status = 'completed';
        await result.save();
        res.status(200).json({ success: true, message: 'Test finalized' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
