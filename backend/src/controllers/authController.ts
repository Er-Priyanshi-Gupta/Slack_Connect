import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { TokenModel } from '../models/Token.js';

dotenv.config();

export class AuthController {
  static initiateSlackAuth(req: Request, res: Response) {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send('Slack configuration is missing.');
    }

    const botScopes = [
      'commands',
      'channels:read',
      'chat:write',
      'chat:write.public',
      'groups:read',
      'im:read',
      'mpim:read'
    ].join(',');

    const userScopes = [
      'chat:write',
      'groups:read',
      'groups:write',
      'users:read',
      'users:read.email'
    ].join(',');

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${botScopes}&user_scope=${userScopes}&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
  }

  static async handleSlackCallback(req: Request, res: Response) {
    const code = req.query.code as string | undefined;
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(400).send('Missing required parameters.');
    }

    try {
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let userId = '';
      let appId = '';

      if (code) {
        const response = await axios.post(
          'https://slack.com/api/oauth.v2.access',
          null,
          {
            params: {
              client_id: clientId,
              client_secret: clientSecret,
              code,
              redirect_uri: redirectUri,
            },
          }
        );

        const data = response.data;

        if (data.ok) {
          accessToken = data.authed_user?.access_token ?? undefined;
          refreshToken = data.authed_user?.refresh_token ?? undefined;
          userId = data.authed_user?.id ?? '';
          appId = data.app_id ?? '';
        }
      }

      // Fallback to env token if Slack didn't return one
      if (!accessToken) {
        console.warn('Using fallback token from .env');
        accessToken = process.env.SLACK_ACCESS_TOKEN;
        userId = process.env.SLACK_USER_ID ?? '';

        // Fetch app_id dynamically using auth.test
        if (accessToken) {
          const authTestRes = await axios.post(
            'https://slack.com/api/auth.test',
            null,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (authTestRes.data.ok) {
            appId = authTestRes.data.app_id ?? '';
          }
        }
      }

      if (!accessToken) {
        return res.status(500).send('No valid Slack access token available.');
      }

      await TokenModel.create({
        user_id: userId,
        app_id: appId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: undefined,
      });

      res.send('Slack authentication successful!');
    } catch (error) {
      console.error('Slack OAuth error:', error.response?.data || error.message);
      res.status(500).send('Slack OAuth failed.');
    }
  }

  static async logout(req: Request, res: Response) {
    const userId = req.body.userId as string | undefined;
    if (!userId) {
      return res.status(400).send('User ID is required.');
    }

    await TokenModel.delete(userId);
    res.send('Logged out successfully.');
  }
}
