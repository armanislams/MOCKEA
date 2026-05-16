import express from 'express';
import { 
    submitPractice, 
    getMySubmissions,
    getSubmissions, 
    reviewSubmission,
    lockSubmission
} from '../controllers/submissions.controller.js';
import verifyUserToken from '../middlewares/verifyUserToken.js';
import verifyUserRole from '../middlewares/verifyUserRole.js';

const sRouter = express.Router();

// Student routes
sRouter.post('/submit', verifyUserToken, submitPractice);
sRouter.get('/my-submissions', verifyUserToken, getMySubmissions);

// Admin/Instructor routes
sRouter.get('/', verifyUserToken, verifyUserRole(['admin', 'instructor']), getSubmissions);
sRouter.patch('/review/:id', verifyUserToken, verifyUserRole(['admin', 'instructor']), reviewSubmission);
sRouter.patch('/lock/:id', verifyUserToken, verifyUserRole(['admin', 'instructor']), lockSubmission);

export default sRouter;
