import { Calendar, MessageSquare, X, AlertCircle, CheckCircle } from 'lucide-react';
import type { ScheduledMessage } from '@/types';

interface MessageCardProps {
  message: ScheduledMessage;
  onCancel: (id: number) => void;
}

export const MessageCard = ({ message, onCancel }: MessageCardProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (message.status) {
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'sent':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const isPending = message.status === 'pending';
  const isFuture = message.scheduled_time > Date.now();

  return (
    <div className="bg-white border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">#{message.channel_name}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {message.status}
          </span>
        </div>
        
        {isPending && isFuture && (
          <button
            onClick={() => onCancel(message.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="Cancel message"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="mb-2">{message.message}</p>
        <div className="flex items-center space-x-4">
          <span>Scheduled: {formatDate(message.scheduled_time)}</span>
          {message.sent_at && (
            <span>Sent: {formatDate(new Date(message.sent_at).getTime())}</span>
          )}
        </div>
      </div>

      {message.error_message && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          Error: {message.error_message}
        </div>
      )}
    </div>
  );
};
