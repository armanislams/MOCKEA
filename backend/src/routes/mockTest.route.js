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
    deleteMockTest,
    gradeSection,
    getUserResults,
    getAllResults,
    getResultDetail,
    lockMockResult
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
mockTestRouter.get('/results/user', getUserResults);
mockTestRouter.get('/results/:id', getResultDetail); // New: Result Detail for Review
mockTestRouter.get('/:id', getMockTestById);
mockTestRouter.post('/start', startTest);
mockTestRouter.post('/submit-section', submitSection);
mockTestRouter.post('/update-cheat-stats', updateCheatStats);
mockTestRouter.post('/finalize', finalizeTest);

// Instructor/Admin Routes for Manual Grading
mockTestRouter.get('/results/all', verifyUserRole(['admin', 'instructor']), getAllResults);
mockTestRouter.patch('/grade-section', verifyUserRole(['admin', 'instructor']), gradeSection);
mockTestRouter.patch('/lock/:id', verifyUserRole(['admin', 'instructor']), lockMockResult);

// Admin-Only Management Routes (Double-check role)
mockTestRouter.post('/create', verifyUserRole(['admin']), createMockTest);
mockTestRouter.put('/:id', verifyUserRole(['admin']), updateMockTest);
mockTestRouter.delete('/:id', verifyUserRole(['admin']), deleteMockTest);

export default mockTestRouter;
