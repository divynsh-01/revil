import express from 'express';
import { addColor, getColors, deleteColor } from '../controllers/colorController.js';
import adminAuth from '../middleware/adminAuth.js';

const colorRouter = express.Router();

// Admin routes (Protected)
colorRouter.post('/add', adminAuth, addColor);
colorRouter.post('/delete', adminAuth, deleteColor);

// Public/Shared routes (e.g. for fetching list in admin or frontend if needed)
colorRouter.get('/list', getColors);

export default colorRouter;
