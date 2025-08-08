import axios from 'axios';
import { Request, Response } from 'express';
import { TokenModel } from '../models/Token.js';

export const slackOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Missing code parameter');
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    const tokenResponse = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      null,
      {
        params: {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        }
      }
    );

    const data = tokenResponse.data;

    if (!data.ok) {
      console.error('Slack OAuth error:', data);
      return res.status(400).json({
        error: 'Slack OAuth failed',
        details: data
      });
    }

    const tokenData = {
      user_id: data.authed_user?.id,
      team_id: data.team?.id,
      team_name: data.team?.name,
      enterprise_id: data.enterprise?.id,
      enterprise_name: data.enterprise?.name,
      access_token: data.access_token, 
      scope: data.scope,
      bot_user_id: data.bot_user_id,
      app_id: data.app_id,
      user_access_token: data.authed_user?.access_token, 
      user_scope: data.authed_user?.scope
    };

    const existing = await TokenModel.findByTeamId(tokenData.team_id);
    if (existing) {
      await TokenModel.updateByTeamId(tokenData.team_id, tokenData);
    } else {
      await TokenModel.create(tokenData);
    }

    res.status(200).send('Slack app installed successfully!');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Internal server error');
  }
};
