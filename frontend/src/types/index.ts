export interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
}

export interface ScheduledMessage {
  id: number;
  user_id: string;
  channel_id: string;
  channel_name: string;
  message: string;
  scheduled_time: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export interface User {
  userId: string;
  teamId: string;
  teamName?: string;
}
