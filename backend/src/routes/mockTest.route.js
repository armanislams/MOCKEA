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
import verifyUserRole from '../middlewares/verifyUserRole.js';

const mockTestRouter = express.Router();

// 1. Authentication (Firebase)
mockTestRouter.use(verifyUserToken);
// 2. Authorization (MongoDB User fetch & Role check)
mockTestRouter.use(verifyUserRole());

// Student/General Authenticated Routes
mockTestRouter.get('/', getAllMockTests);
mockTestRouter.get('/:id', getMockTestById);
mockTestRouter.post('/start', startTest);
mockTestRouter.post('/submit-section', submitSection);
mockTestRouter.post('/update-cheat-stats', updateCheatStats);
mockTestRouter.post('/finalize', finalizeTest);

// Admin-Only Management Routes (Double-check role)
mockTestRouter.post('/create', verifyUserRole(['admin']), createMockTest);
mockTestRouter.put('/:id', verifyUserRole(['admin']), updateMockTest);
mockTestRouter.delete('/:id', verifyUserRole(['admin']), deleteMockTest);

export default mockTestRouter;
