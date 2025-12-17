import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/ActivityItem';
import { fetchActivity, ActivityEvent } from '@/lib/api';
import { useWalletStore } from '@/store/walletStore';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'my';

export const Activity = () => {
  const { address, isConnected } = useWalletStore();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isPolling, setIsPolling] = useState(false);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      const params = filter === 'my' && address ? { address } : undefined;
      const data = await fetchActivity(params);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [filter, address]);

  // Polling for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadActivity();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [filter, address]);

  const handleRefresh = () => {
    setIsPolling(true);
    loadActivity().finally(() => setIsPolling(false));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ActivityIcon className="w-8 h-8 text-primary" />
            Activity Feed
          </h1>
          <p className="text-muted-foreground">
            Real-time blockchain events from Chainhooks.
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isPolling}
          className="border-border"
        >
          <RefreshCw className={cn("w-4 h-4", isPolling && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={cn(
            filter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All Activity
        </Button>
        <Button
          variant={filter === 'my' ? 'default' : 'outline'}
          onClick={() => setFilter('my')}
          disabled={!isConnected}
          className={cn(
            filter === 'my' 
              ? 'bg-primary text-primary-foreground' 
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          My Activity
        </Button>
      </div>

      {/* Activity List */}
      <div className="p-6 rounded-xl bg-card border border-border">
        {isLoading && events.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={event.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ActivityItem event={event} userAddress={address || undefined} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ActivityIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Activity</h2>
            <p className="text-muted-foreground">
              {filter === 'my' 
                ? 'No activity found for your address.' 
                : 'No recent blockchain events.'}
            </p>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        Auto-refreshing every 30 seconds
      </div>
    </div>
  );
};
