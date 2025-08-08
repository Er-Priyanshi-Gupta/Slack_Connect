import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

router.get('/slack', AuthController.initiateSlackAuth);
router.get('/slack/callback', AuthController.handleSlackCallback);
router.post('/logout', AuthController.logout);

export default router;
