import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getUserProfileController } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile', protect, getUserProfileController);

export default router;