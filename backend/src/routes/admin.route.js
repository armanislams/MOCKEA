import express from 'express';
import { getSystemAnalytics } from '../controllers/admin.controller.js';

const adminRouter = express.Router();

adminRouter.get('/system-analytics', getSystemAnalytics);

export default adminRouter;
