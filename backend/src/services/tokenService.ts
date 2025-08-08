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
    const tokenRecord = await TokenModel.findByUserId(userId); // ✅ await

    if (!tokenRecord) {
      throw new Error('No token found for user');
    }

    // Check if token is expired
    if (tokenRecord.expires_at && Date.now() >= tokenRecord.expires_at * 1000) {
      // Try to refresh if refresh_token exists
      if (tokenRecord.refresh_token) {
        try {
          const refreshedData = await SlackService.refreshToken(tokenRecord.refresh_token);

          // Update token in database
          await TokenModel.updateByTeamId(tokenRecord.team_id, {
            access_token: refreshedData.authed_user?.access_token || tokenRecord.access_token,
            refresh_token: refreshedData.authed_user?.refresh_token || tokenRecord.refresh_token,
            expires_at: refreshedData.expires_in
              ? Math.floor(Date.now() / 1000) + refreshedData.expires_in
              : tokenRecord.expires_at
          });

          return refreshedData.authed_user?.access_token || tokenRecord.access_token;
        } catch (error) {
          // Refresh failed → delete token and ask for re-authentication
          await TokenModel.deleteByTeamId(tokenRecord.team_id);
          throw new Error('Token refresh failed, re-authentication required');
        }
      } else {
        // No refresh token
        await TokenModel.deleteByTeamId(tokenRecord.team_id);
        throw new Error('Token expired and no refresh token available');
      }
    }

    return tokenRecord.access_token;
  }
}
