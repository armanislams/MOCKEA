import express from 'express';
import { 
    getAllMockTests, 
    getMockTestById, 
    createMockTest, 
    startTest, 
    submitSection, 
    updateCheatStats, 
    finalizeTest 
} from '../controllers/mockTest.controller.js';

const router = express.Router();

router.get('/', getAllMockTests);
router.get('/:id', getMockTestById);
router.post('/create', createMockTest);
router.post('/start', startTest);
router.post('/submit-section', submitSection);
router.post('/update-cheat-stats', updateCheatStats);
router.post('/finalize', finalizeTest);

export default router;
