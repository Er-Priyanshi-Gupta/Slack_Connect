import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Channel } from '@/types';

interface ChannelSelectProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  loading?: boolean;
}

export const ChannelSelect = ({ 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  loading 
}: ChannelSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getChannelPrefix = (channel: Channel) => {
    if (channel.is_channel) return '#';
    if (channel.is_group) return '🔒';
    if (channel.is_im) return '@';
    if (channel.is_mpim) return '👥';
    return '#';
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-left focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <span className="truncate">
          {selectedChannel 
            ? `${getChannelPrefix(selectedChannel)}${selectedChannel.name}`
            : 'Select a channel...'
          }
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-muted-foreground">Loading channels...</div>
          ) : channels.length === 0 ? (
            <div className="px-3 py-2 text-muted-foreground">No channels found</div>
          ) : (
            channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => {
                  onChannelSelect(channel);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none"
              >
                <span className="font-medium">
                  {getChannelPrefix(channel)}{channel.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
