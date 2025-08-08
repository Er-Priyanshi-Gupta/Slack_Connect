import { LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8" />
            <h1 className="text-xl font-bold">Slack Connect</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Connected to: <span className="font-medium">{user.teamName || 'Slack Workspace'}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
