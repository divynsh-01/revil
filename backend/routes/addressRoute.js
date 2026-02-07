import express from 'express';
import { addAddress, getUserAddresses, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController.js';
import authUser from '../middleware/auth.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
addressRouter.post('/list', authUser, getUserAddresses);
addressRouter.post('/update', authUser, updateAddress);
addressRouter.post('/delete', authUser, deleteAddress);
addressRouter.post('/set-default', authUser, setDefaultAddress);

export default addressRouter;
