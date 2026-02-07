import express from 'express';
import { addCategory, getCategories, getActiveCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

// Admin routes
categoryRouter.post('/add', adminAuth, addCategory);
categoryRouter.post('/update', adminAuth, updateCategory);
categoryRouter.post('/delete', adminAuth, deleteCategory);

// Public routes
categoryRouter.get('/list', getCategories);
categoryRouter.get('/active', getActiveCategories);

export default categoryRouter;
