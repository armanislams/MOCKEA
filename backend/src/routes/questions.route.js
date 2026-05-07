import express from 'express'
import { getQuestions, postQuestion } from '../controllers/questions.controller.js'


const qRouter = express.Router()

qRouter.post('/add' ,postQuestion)
qRouter.get('/' ,getQuestions)
// qRouter.put('/:id' ,updateQuestion)
// qRouter.delete('/:id' ,deleteQuestion)



export default qRouter;