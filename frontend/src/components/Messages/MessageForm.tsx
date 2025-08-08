import { useState } from 'react';
import { Send, Clock } from 'lucide-react';
import { ChannelSelect } from '@/components/Channels/ChannelSelect';
import { useChannels } from '@/hooks/useChannels';
import { useMessages } from '@/hooks/useMessages';
import type { Channel } from '@/types';

export const MessageForm = () => {
  const { channels, loading: channelsLoading } = useChannels();
  const { sendMessage, scheduleMessage } = useMessages();
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChannel || !message.trim()) {
      return;
    }

    setSending(true);
    
    try {
      let success = false;
      
      if (isScheduled && scheduledTime) {
        success = await scheduleMessage(
          selectedChannel.id,
          selectedChannel.name,
          message,
          scheduledTime
        );
      } else {
        success = await sendMessage(selectedChannel.id, message);
      }
      
      if (success) {
        setMessage('');
        setScheduledTime('');
        setSelectedChannel(null);
        setIsScheduled(false);
      }
    } finally {
      setSending(false);
    }
  };

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 1);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">Send Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Channel</label>
          <ChannelSelect
            channels={channels}
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
            loading={channelsLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="schedule"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            className="rounded border-input focus:ring-ring"
          />
          <label htmlFor="schedule" className="text-sm font-medium">
            Schedule for later
          </label>
        </div>

        {isScheduled && (
          <div>
            <label className="block text-sm font-medium mb-2">Scheduled Time</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={minDateTimeString}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required={isScheduled}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedChannel || !message.trim() || sending || (isScheduled && !scheduledTime)}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          {isScheduled ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          <span>
            {sending 
              ? (isScheduled ? 'Scheduling...' : 'Sending...') 
              : (isScheduled ? 'Schedule Message' : 'Send Message')
            }
          </span>
        </button>
      </form>
    </div>
  );
};
