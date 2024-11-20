import express from 'express';

import { signup, login, logout, updateAvatar, checkAuth } from '../controllers/auth.controller.js';  
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.patch('/updateAvatar', protectRoute, updateAvatar);
router.get('/check', protectRoute, checkAuth)

export default router;