import { RefreshCw } from 'lucide-react';
import { MessageCard } from './MessageCard';
import { useMessages } from '@/hooks/useMessages';

export const ScheduledMessages = () => {
  const { scheduledMessages, loading, cancelScheduledMessage, refetch } = useMessages();

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this scheduled message?')) {
      await cancelScheduledMessage(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Scheduled Messages</h2>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading scheduled messages...
        </div>
      ) : scheduledMessages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No scheduled messages found.
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledMessages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
