import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SlackService } from '../services/slackService.js';
import { TokenService } from '../services/tokenService.js';
import { ScheduledMessageModel } from '../models/ScheduledMessage.js';

export class MessageController {
  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { channelId, message } = req.body;

      if (!channelId || !message) {
        res.status(400).json({ error: 'Channel ID and message are required' });
        return;
      }

      const accessToken = await TokenService.getValidAccessToken(req.user.userId);
      await SlackService.sendMessage(accessToken, channelId, message);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Send message error:', error);
      
      if (error instanceof Error && error.message.includes('re-authentication required')) {
        res.status(401).json({ error: 'Re-authentication required' });
      } else {
        res.status(500).json({ error: 'Failed to send message' });
      }
    }
  }

  static async scheduleMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { channelId, channelName, message, scheduledTime } = req.body;

      if (!channelId || !channelName || !message || !scheduledTime) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const scheduledTimeMs = new Date(scheduledTime).getTime();
      
      if (scheduledTimeMs <= Date.now()) {
        res.status(400).json({ error: 'Scheduled time must be in the future' });
        return;
      }

      const scheduledMessage = ScheduledMessageModel.create({
        user_id: req.user.userId,
        channel_id: channelId,
        channel_name: channelName,
        message,
        scheduled_time: scheduledTimeMs,
        status: 'pending',
      });
      
      res.json({ success: true, scheduledMessage });
    } catch (error) {
      console.error('Schedule message error:', error);
      res.status(500).json({ error: 'Failed to schedule message' });
    }
  }

  static async getScheduledMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const messages = ScheduledMessageModel.findByUserId(req.user.userId);
      res.json({ messages });
    } catch (error) {
      console.error('Get scheduled messages error:', error);
      res.status(500).json({ error: 'Failed to fetch scheduled messages' });
    }
  }

  static async cancelScheduledMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Message ID is required' });
        return;
      }

      ScheduledMessageModel.delete(parseInt(id), req.user.userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Cancel scheduled message error:', error);
      res.status(500).json({ error: 'Failed to cancel scheduled message' });
    }
  }
}
