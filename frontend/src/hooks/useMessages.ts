import { useState, useEffect } from 'react';
import { messagesAPI } from '@/services/api';
import type { ScheduledMessage } from '@/types';

export const useMessages = () => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await messagesAPI.getScheduledMessages();
      setScheduledMessages(response.data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scheduled messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (channelId: string, message: string) => {
    try {
      await messagesAPI.sendMessage(channelId, message);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    }
  };

  const scheduleMessage = async (
    channelId: string,
    channelName: string,
    message: string,
    scheduledTime: string
  ) => {
    try {
      await messagesAPI.scheduleMessage(channelId, channelName, message, scheduledTime);
      await fetchScheduledMessages(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule message');
      return false;
    }
  };

  const cancelScheduledMessage = async (id: number) => {
    try {
      await messagesAPI.cancelScheduledMessage(id);
      await fetchScheduledMessages(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel message');
      return false;
    }
  };

  useEffect(() => {
    fetchScheduledMessages();
  }, []);

  return {
    scheduledMessages,
    loading,
    error,
    sendMessage,
    scheduleMessage,
    cancelScheduledMessage,
    refetch: fetchScheduledMessages,
  };
};
