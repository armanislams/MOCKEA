import express from 'express';
import { 
    getAllMockTests, 
    getMockTestById, 
    createMockTest, 
    startTest, 
    submitSection, 
    updateCheatStats, 
    finalizeTest,
    updateMockTest,
    deleteMockTest
} from '../controllers/mockTest.controller.js';
import verifyUserToken from '../middlewares/verifyUserToken.js';

const mockTestRouter = express.Router();


mockTestRouter.use(verifyUserToken)
mockTestRouter.get('/', getAllMockTests);
mockTestRouter.get('/:id', getMockTestById);
mockTestRouter.post('/create', createMockTest);
mockTestRouter.post('/start', startTest);
mockTestRouter.post('/submit-section', submitSection);
mockTestRouter.post('/update-cheat-stats', updateCheatStats);
mockTestRouter.post('/finalize', finalizeTest);
mockTestRouter.put('/:id', updateMockTest);
mockTestRouter.delete('/:id', deleteMockTest);

export default mockTestRouter;
