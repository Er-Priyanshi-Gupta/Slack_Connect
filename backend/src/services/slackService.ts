import axios from 'axios';

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
}

export interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  refresh_token?: string;
  team: {
    id: string;
    name: string;
  };
  authed_user: {
    id: string;
    access_token: string;
    refresh_token?: string;
  };
  expires_in?: number;
}

export class SlackService {
  private static readonly BASE_URL = 'https://slack.com/api';

  static async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    const response = await axios.post(`${this.BASE_URL}/oauth.v2.access`, null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.data.ok) {
      throw new Error(`Slack OAuth error: ${response.data.error}`);
    }

    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<SlackOAuthResponse> {
    const response = await axios.post(`${this.BASE_URL}/oauth.v2.access`, null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.data.ok) {
      throw new Error(`Slack token refresh error: ${response.data.error}`);
    }

    return response.data;
  }

  static async getChannels(accessToken: string): Promise<SlackChannel[]> {
    const channels: SlackChannel[] = [];
    
    // Get public channels
    const channelsResponse = await axios.get(`${this.BASE_URL}/conversations.list`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { types: 'public_channel,private_channel' },
    });

    if (channelsResponse.data.ok) {
      channels.push(...channelsResponse.data.channels);
    }

    return channels;
  }

  static async sendMessage(accessToken: string, channelId: string, message: string): Promise<void> {
    const response = await axios.post(
      `${this.BASE_URL}/chat.postMessage`,
      {
        channel: channelId,
        text: message,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Failed to send message: ${response.data.error}`);
    }
  }
}
