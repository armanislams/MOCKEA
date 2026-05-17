import express from 'express';
import { getPublicMockTests, getPublicMockTestById } from '../controllers/publicMockTest.controller.js';

const router = express.Router();

// GET /api/public-mock-tests - list public tests
router.get('/', getPublicMockTests);

// GET /api/public-mock-tests/:id - get a single public test
router.get('/:id', getPublicMockTestById);

export default router;
