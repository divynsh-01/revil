import express from 'express';
import { addSubCategory, getSubCategories, getActiveSubCategories, getAllSubCategories, updateSubCategory, deleteSubCategory } from '../controllers/subCategoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const subCategoryRouter = express.Router();

// Admin routes
subCategoryRouter.post('/add', adminAuth, addSubCategory);
subCategoryRouter.post('/update', adminAuth, updateSubCategory);
subCategoryRouter.post('/delete', adminAuth, deleteSubCategory);

// Public routes
subCategoryRouter.get('/list', getAllSubCategories);
subCategoryRouter.get('/list/:categoryId', getSubCategories);
subCategoryRouter.get('/active/:categoryId', getActiveSubCategories);

export default subCategoryRouter;
