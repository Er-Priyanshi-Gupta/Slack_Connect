import { Request, Response } from 'express';
import { SlackService } from '../services/slackService.js';
import { TokenService } from '../services/tokenService.js';
import { TokenModel } from '../models/Token.js';

export class AuthController {
  static initiateSlackAuth(req: Request, res: Response): void {
    const scopes = [
      'channels:read',
      'chat:write',
      'chat:write.public',
      'groups:read',
      'im:read',
      'mpim:read'
    ].join(',');

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI!)}&response_type=code`;
    
    res.redirect(authUrl);
  }

  static async handleSlackCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, error } = req.query;

      if (error) {
        res.redirect(`${process.env.FRONTEND_URL}?error=${error}`);
        return;
      }

      if (!code) {
        res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
        return;
      }

      const tokenData = await SlackService.exchangeCodeForToken(code as string);
      
      // Store tokens in database
      const existingToken = TokenModel.findByUserId(tokenData.authed_user.id);
      
      if (existingToken) {
        TokenModel.update(tokenData.authed_user.id, {
          access_token: tokenData.authed_user.access_token,
          refresh_token: tokenData.authed_user.refresh_token,
          expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : undefined,
        });
      } else {
        TokenModel.create({
          user_id: tokenData.authed_user.id,
          team_id: tokenData.team.id,
          access_token: tokenData.authed_user.access_token,
          refresh_token: tokenData.authed_user.refresh_token,
          expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : undefined,
        });
      }

      // Generate JWT for frontend
      const jwtToken = TokenService.generateJWT(tokenData.authed_user.id, tokenData.team.id);
      
      res.redirect(`${process.env.FRONTEND_URL}?token=${jwtToken}&team=${tokenData.team.name}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
    }
  }

  static logout(req: Request, res: Response): void {
    // In a real app, you might want to invalidate the JWT token
    // For now, we'll just return success and let the frontend handle token removal
    res.json({ success: true });
  }
}
