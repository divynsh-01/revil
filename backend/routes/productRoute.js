import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Use upload.any() to accept dynamic image field names (image0, image1, etc.)
productRouter.post('/add', adminAuth, upload.any(), addProduct);
productRouter.post('/update', adminAuth, upload.any(), updateProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts)

export default productRouter