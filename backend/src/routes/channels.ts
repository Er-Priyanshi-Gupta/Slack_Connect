import { Router } from 'express';
import { ChannelController } from '../controllers/channelController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, ChannelController.getChannels);

export default router;
