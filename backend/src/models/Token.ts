import db from '../utils/database.js';

export interface Token {
  id?: number;
  user_id: string;
  team_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  created_at?: string;
  updated_at?: string;
}

export class TokenModel {
  static create(token: Omit<Token, 'id' | 'created_at' | 'updated_at'>): Token {
    const stmt = db.prepare(`
      INSERT INTO tokens (user_id, team_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      token.user_id,
      token.team_id,
      token.access_token,
      token.refresh_token,
      token.expires_at
    );
    
    return { ...token, id: result.lastInsertRowid as number };
  }

  static findByUserId(userId: string): Token | null {
    const stmt = db.prepare('SELECT * FROM tokens WHERE user_id = ?');
    return stmt.get(userId) as Token | null;
  }

  static update(userId: string, updates: Partial<Token>): void {
    const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`);
    const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
    
    const stmt = db.prepare(`
      UPDATE tokens 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    
    stmt.run(...values, userId);
  }

  static delete(userId: string): void {
    const stmt = db.prepare('DELETE FROM tokens WHERE user_id = ?');
    stmt.run(userId);
  }
}
