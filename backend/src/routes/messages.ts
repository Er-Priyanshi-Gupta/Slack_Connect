import { Router } from 'express';
import { MessageController } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/send', authenticateToken, MessageController.sendMessage);
router.post('/schedule', authenticateToken, MessageController.scheduleMessage);
router.get('/scheduled', authenticateToken, MessageController.getScheduledMessages);
router.delete('/scheduled/:id', authenticateToken, MessageController.cancelScheduledMessage);

export default router;
