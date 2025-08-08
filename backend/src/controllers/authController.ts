import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import TokenModel from '../models/Token.js';

dotenv.config();

export class AuthController {
  // Step 1: Redirect to Slack OAuth page
  static initiateSlackAuth(req: Request, res: Response) {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      scope: 'channels:read,chat:write,users:read', // adjust as needed
      user_scope: 'users:read', // adjust as needed
      redirect_uri: process.env.SLACK_REDIRECT_URI!,
    });

    res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  }

  // Step 2: Handle callback from Slack
  static async handleSlackCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).send('Missing OAuth code from Slack');
      }

      // Exchange code for tokens
      const tokenResponse = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          code,
          client_id: process.env.SLACK_CLIENT_ID!,
          client_secret: process.env.SLACK_CLIENT_SECRET!,
          redirect_uri: process.env.SLACK_REDIRECT_URI!,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const tokenData = tokenResponse.data;

      if (!tokenData.ok) {
        console.error('Slack OAuth error:', tokenData.error);
        return res.status(400).send(`Slack OAuth failed: ${tokenData.error}`);
      }

      // Extract tokens safely
      const botAccessToken: string | undefined = tokenData.access_token || undefined;
      const userAccessToken: string | undefined =
        tokenData.authed_user?.access_token || undefined;
      const refreshToken: string | undefined = tokenData.refresh_token || undefined;
      const expiresAt: number | undefined = tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : undefined;

      // Ensure we have at least a bot token to store
      if (!botAccessToken) {
        return res.status(500).send('No bot access token returned by Slack');
      }

      // Store in DB
      const existing = await TokenModel.findByTeamId(tokenData.team.id);
      if (existing) {
        await TokenModel.update(tokenData.authed_user?.id || 'unknown', {
          bot_access_token: botAccessToken,
          user_access_token: userAccessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        });
      } else {
        await TokenModel.create({
          user_id: tokenData.authed_user?.id || 'unknown',
          team_id: tokenData.team.id,
          bot_access_token: botAccessToken,
          user_access_token: userAccessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        });
      }

      res.send('Slack OAuth successful! Tokens stored.');
    } catch (error) {
      console.error('Error during Slack callback:', error);
      res.status(500).send('OAuth callback error');
    }
  }

  // Step 3: Logout
  static async logout(req: Request, res: Response) {
    try {
      // Implement token deletion if needed
      res.send('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).send('Logout failed');
    }
  }
}
