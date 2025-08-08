import db from '../utils/database.js';

export interface Token {
  id?: number;
  user_id: string;            // Slack authed_user.id
  team_id: string;            // Slack team.id
  team_name?: string;         // Slack team.name
  enterprise_id?: string;     // Slack enterprise.id (optional)
  enterprise_name?: string;   // Slack enterprise.name (optional)
  access_token: string;       // Bot token (xoxb-...)
  refresh_token?: string;
  expires_in?: number;
  scope: string;              // Bot scope
  bot_user_id: string;        // bot_user_id from Slack
  app_id: string;             // Slack app_id
  user_access_token?: string; // User token (xoxp-...)
  user_scope?: string;        // User scope
}

export const TokenModel = {
  async create(token: Token) {
    const [id] = await db('tokens').insert(token).returning('id');
    return id;
  },

  async findByTeamId(team_id: string) {
    return db('tokens').where({ team_id }).first();
  },

  async updateByTeamId(team_id: string, token: Partial<Token>) {
    return db('tokens').where({ team_id }).update(token);
  }
};
