import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData, updateColor } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.post('/update-emotion', updateColor);

export default userRouter;