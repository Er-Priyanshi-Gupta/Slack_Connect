import { MessageSquare, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SlackConnect = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Slack Connect
          </h1>
          <p className="text-muted-foreground">
            Connect your Slack workspace to send messages immediately or schedule them for later.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <div className="bg-accent/10 p-2 rounded-full">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium">Instant Messaging</h3>
              <p className="text-sm text-muted-foreground">Send messages to any channel immediately</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <div className="bg-secondary/10 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium">Schedule Messages</h3>
              <p className="text-sm text-muted-foreground">Plan and schedule messages for future delivery</p>
            </div>
          </div>
        </div>

        <button
          onClick={login}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Connect to Slack</span>
        </button>

        <p className="text-xs text-muted-foreground mt-4">
          By connecting, you agree to allow this app to send messages on your behalf.
        </p>
      </div>
    </div>
  );
};
