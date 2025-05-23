import express from 'express';
import { getUsers, getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, getUsers);
router.get('/messages/:userId', protect, getMessages);
router.post('/messages', protect, sendMessage);

export default router;