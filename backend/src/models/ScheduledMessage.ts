import db from '../utils/database.js';

export interface ScheduledMessage {
  id?: number;
  user_id: string;
  channel_id: string;
  channel_name: string;
  message: string;
  scheduled_time: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at?: string;
  sent_at?: string;
  error_message?: string;
}

export class ScheduledMessageModel {
  static create(message: Omit<ScheduledMessage, 'id' | 'created_at' | 'sent_at' | 'error_message'>): ScheduledMessage {
    const stmt = db.prepare(`
      INSERT INTO scheduled_messages (user_id, channel_id, channel_name, message, scheduled_time, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      message.user_id,
      message.channel_id,
      message.channel_name,
      message.message,
      message.scheduled_time,
      message.status
    );
    
    return { ...message, id: result.lastInsertRowid as number };
  }

  static findByUserId(userId: string): ScheduledMessage[] {
    const stmt = db.prepare('SELECT * FROM scheduled_messages WHERE user_id = ? ORDER BY scheduled_time ASC');
    return stmt.all(userId) as ScheduledMessage[];
  }

  static findPendingMessages(): ScheduledMessage[] {
    const now = Date.now();
    const stmt = db.prepare('SELECT * FROM scheduled_messages WHERE status = ? AND scheduled_time <= ?');
    return stmt.all('pending', now) as ScheduledMessage[];
  }

  static updateStatus(id: number, status: string, sentAt?: string, errorMessage?: string): void {
    const stmt = db.prepare(`
      UPDATE scheduled_messages 
      SET status = ?, sent_at = ?, error_message = ?
      WHERE id = ?
    `);
    
    stmt.run(status, sentAt, errorMessage, id);
  }

  static delete(id: number, userId: string): void {
    const stmt = db.prepare('DELETE FROM scheduled_messages WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }
}
