import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Layout/Header';
import { SlackConnect } from '@/components/Auth/SlackConnect';
import { MessageForm } from '@/components/Messages/MessageForm';
import { ScheduledMessages } from '@/components/Messages/ScheduledMessages';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SlackConnect />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <MessageForm />
          </div>
          <div>
            <ScheduledMessages />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
