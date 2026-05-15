import express from 'express';
import { 
    submitPractice, 
    getSubmissions, 
    reviewSubmission 
} from '../controllers/submissions.controller.js';
import verifyUserToken from '../middlewares/verifyUserToken.js';
import verifyUserRole from '../middlewares/verifyUserRole.js';

const sRouter = express.Router();

// Student routes
sRouter.post('/submit', verifyUserToken, submitPractice);

// Admin/Instructor routes
sRouter.get('/', verifyUserToken, verifyUserRole(['admin', 'instructor']), getSubmissions);
sRouter.patch('/review/:id', verifyUserToken, verifyUserRole(['admin', 'instructor']), reviewSubmission);

export default sRouter;
