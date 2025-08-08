import db from '../utils/database.js'; 
export interface Token {
  id?: number;
  user_id: string;
  team_id: string;
  team_name?: string;
  enterprise_id?: string;
  enterprise_name?: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope: string;
  bot_user_id: string;
  app_id: string;
  user_access_token?: string;
  user_scope?: string;
}

export const TokenModel = {
  create(token: Token) {
    const stmt = db.prepare(`
      INSERT INTO tokens (
        user_id, team_id, team_name, enterprise_id, enterprise_name,
        access_token, refresh_token, expires_in, scope,
        bot_user_id, app_id, user_access_token, user_scope
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      token.user_id,
      token.team_id,
      token.team_name || null,
      token.enterprise_id || null,
      token.enterprise_name || null,
      token.access_token,
      token.refresh_token || null,
      token.expires_in || null,
      token.scope,
      token.bot_user_id,
      token.app_id,
      token.user_access_token || null,
      token.user_scope || null
    );
    return info.lastInsertRowid;
  },

  findByTeamId(team_id: string) {
    const stmt = db.prepare(`SELECT * FROM tokens WHERE team_id = ?`);
    return stmt.get(team_id);
  },

  findByUserId(user_id: string) {
    const stmt = db.prepare(`SELECT * FROM tokens WHERE user_id = ?`);
    return stmt.get(user_id);
  },

  updateByTeamId(team_id: string, token: Partial<Token>) {
    const fields = Object.keys(token).map(key => `${key} = ?`).join(', ');
    const values = Object.values(token);
    const stmt = db.prepare(`UPDATE tokens SET ${fields} WHERE team_id = ?`);
    return stmt.run(...values, team_id);
  },

  update(id: number, token: Partial<Token>) {
    const fields = Object.keys(token).map(key => `${key} = ?`).join(', ');
    const values = Object.values(token);
    const stmt = db.prepare(`UPDATE tokens SET ${fields} WHERE id = ?`);
    return stmt.run(...values, id);
  },

  delete(id: number) {
    const stmt = db.prepare(`DELETE FROM tokens WHERE id = ?`);
    return stmt.run(id);
  },

  deleteByTeamId(team_id: string) {
    const stmt = db.prepare(`DELETE FROM tokens WHERE team_id = ?`);
    return stmt.run(team_id);
  }
};
