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

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=commands,chat:write,channels:read,groups:read,im:read,mpim:read&redirect_uri=${redirectUri}`;
    res.redirect(authUrl);
  }

  static async handleSlackCallback(req: Request, res: Response) {
    const code = req.query.code as string | undefined;
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    if (!code || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).send('Missing required parameters.');
    }

    try {
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

      if (!data.ok) {
        return res.status(400).json({ error: data.error });
      }

      const accessToken: string | undefined = data.authed_user?.access_token ?? undefined;
      const refreshToken: string | undefined = data.authed_user?.refresh_token ?? undefined;

      if (!accessToken) {
        return res.status(500).send('Slack did not return an access token.');
      }

      TokenModel.create({
        user_id: data.authed_user?.id ?? '',
        team_id: data.team?.id ?? '',
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: data.authed_user?.expires_in
          ? Date.now() + data.authed_user.expires_in * 1000
          : undefined,
      });

      res.send('Slack authentication successful!');
    } catch (error) {
      console.error('Slack OAuth error:', error);
      res.status(500).send('Slack OAuth failed.');
    }
  }

  static logout(req: Request, res: Response) {
    const userId = req.body.userId as string | undefined;
    if (!userId) {
      return res.status(400).send('User ID is required.');
    }

    TokenModel.delete(userId);
    res.send('Logged out successfully.');
  }
}
