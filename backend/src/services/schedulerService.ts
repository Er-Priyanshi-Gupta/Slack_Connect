import cron from 'node-cron';
import { ScheduledMessageModel } from '../models/ScheduledMessage.js';
import { SlackService } from './slackService.js';
import { TokenService } from './tokenService.js';

export class SchedulerService {
  static init(): void {
    cron.schedule('* * * * *', async () => {
      try {
        const pendingMessages = ScheduledMessageModel.findPendingMessages();
        
        for (const message of pendingMessages) {
          try {
            const accessToken = await TokenService.getValidAccessToken(message.user_id);
            await SlackService.sendMessage(accessToken, message.channel_id, message.message);
            
            ScheduledMessageModel.updateStatus(
              message.id!,
              'sent',
              new Date().toISOString()
            );
            
            console.log(`Sent scheduled message ${message.id} to channel ${message.channel_name}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ScheduledMessageModel.updateStatus(
              message.id!,
              'failed',
              undefined,
              errorMessage
            );
            
            console.error(`Failed to send scheduled message ${message.id}:`, errorMessage);
          }
        }
      } catch (error) {
        console.error('Error in scheduler:', error);
      }
    });

    console.log('Message scheduler initialized');
  }
}
