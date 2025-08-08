import jwt from 'jsonwebtoken';
import { TokenModel, Token } from '../models/Token.js';
import { SlackService } from './slackService.js';

export class TokenService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

  static generateJWT(userId: string, teamId: string): string {
    return jwt.sign({ userId, teamId }, this.JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyJWT(token: string): { userId: string; teamId: string } {
    return jwt.verify(token, this.JWT_SECRET) as { userId: string; teamId: string };
  }

  static async getValidAccessToken(userId: string): Promise<string> {
    const tokenRecord = TokenModel.findByUserId(userId);
    
    if (!tokenRecord) {
      throw new Error('No token found for user');
    }

    // Check if token is still valid (if expires_at is set)
    if (tokenRecord.expires_at && Date.now() >= tokenRecord.expires_at * 1000) {
      // Token expired, try to refresh
      if (tokenRecord.refresh_token) {
        try {
          const refreshedData = await SlackService.refreshToken(tokenRecord.refresh_token);
          
          // Update token in database
          TokenModel.update(userId, {
            access_token: refreshedData.authed_user.access_token,
            refresh_token: refreshedData.authed_user.refresh_token,
            expires_at: refreshedData.expires_in ? Math.floor(Date.now() / 1000) + refreshedData.expires_in : undefined,
          });

          return refreshedData.authed_user.access_token;
        } catch (error) {
          // Refresh failed, user needs to re-authenticate
          TokenModel.delete(userId);
          throw new Error('Token refresh failed, re-authentication required');
        }
      } else {
        // No refresh token available
        TokenModel.delete(userId);
        throw new Error('Token expired and no refresh token available');
      }
    }

    return tokenRecord.access_token;
  }
}
