import express from 'express'
import { 
    getQuestions, 
    postQuestion,
    updateQuestion,
    deleteQuestion 
} from '../controllers/questions.controller.js'
import verifyUserToken from '../middlewares/verifyUserToken.js';
import verifyUserRole from '../middlewares/verifyUserRole.js';

const qRouter = express.Router();

// All question routes require authentication
qRouter.use(verifyUserToken);

// Reading questions is allowed for students/authenticated users
qRouter.get('/', getQuestions);

// Modifying the question bank is restricted to admins
qRouter.post('/add', verifyUserRole(['admin']), postQuestion);
qRouter.put('/:id', verifyUserRole(['admin']), updateQuestion);
qRouter.delete('/:id', verifyUserRole(['admin']), deleteQuestion);

export default qRouter;