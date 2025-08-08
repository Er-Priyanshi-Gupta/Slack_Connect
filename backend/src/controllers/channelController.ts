import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SlackService } from '../services/slackService.js';
import { TokenService } from '../services/tokenService.js';

export class ChannelController {
  static async getChannels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const accessToken = await TokenService.getValidAccessToken(req.user.userId);
      const channels = await SlackService.getChannels(accessToken);
      
      res.json({ channels });
    } catch (error) {
      console.error('Get channels error:', error);
      
      if (error instanceof Error && error.message.includes('re-authentication required')) {
        res.status(401).json({ error: 'Re-authentication required' });
      } else {
        res.status(500).json({ error: 'Failed to fetch channels' });
      }
    }
  }
}
