import { Request, Response } from 'express';
import { SlackService } from '../services/slackService.js';
import { TokenService } from '../services/tokenService.js';
import { TokenModel } from '../models/Token.js';

export class AuthController {
  static initiateSlackAuth(req: Request, res: Response): void {
    const botScopes = [
      'channels:read',
      'chat:write',
      'chat:write.public',
      'groups:read',
      'im:read',
      'mpim:read'
    ].join(',');

    const authUrl = `https://slack.com/oauth/v2/authorize` +
      `?client_id=${process.env.SLACK_CLIENT_ID}` +
      `&scope=${botScopes}` +
      `&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI!)}`;

    res.redirect(authUrl);
  }

  static async handleSlackCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, error } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=${encodeURIComponent(error as string)}`);
      }

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
      }

      // Exchange code for tokens
      const tokenData = await SlackService.exchangeCodeForToken(code as string);

      // Slack returns bot access token at root and optionally a user token under authed_user
      const botAccessToken = tokenData.access_token;
      const userAccessToken = tokenData.authed_user?.access_token || null;
      const refreshToken = tokenData.refresh_token || null;

      // Store in DB (replace with your async DB methods)
      const existingToken = await TokenModel.findByUserId(tokenData.authed_user.id);

      if (existingToken) {
        await TokenModel.update(tokenData.authed_user.id, {
          bot_access_token: botAccessToken,
          user_access_token: userAccessToken,
          refresh_token: refreshToken,
          expires_at: tokenData.expires_in
            ? Math.floor(Date.now() / 1000) + tokenData.expires_in
            : undefined,
        });
      } else {
        await TokenModel.create({
          user_id: tokenData.authed_user.id,
          team_id: tokenData.team.id,
          bot_access_token: botAccessToken,
          user_access_token: userAccessToken,
          refresh_token: refreshToken,
          expires_at: tokenData.expires_in
            ? Math.floor(Date.now() / 1000) + tokenData.expires_in
            : undefined,
        });
      }

      // Generate JWT for frontend
      const jwtToken = TokenService.generateJWT(tokenData.authed_user.id, tokenData.team.id);

      res.redirect(`${process.env.FRONTEND_URL}?token=${jwtToken}&team=${encodeURIComponent(tokenData.team.name)}`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
    }
  }

  static logout(_req: Request, res: Response): void {
    // Invalidate session/token if needed
    res.json({ success: true });
  }
}
