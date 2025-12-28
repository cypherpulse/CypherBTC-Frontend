import { ArrowUpRight, ArrowDownLeft, Coins, Image, User, ExternalLink, Clock } from 'lucide-react';
import { ActivityEvent } from '@/lib/api';
import { truncateAddress, formatBalance } from '@/lib/stacks';
import { EXPLORER_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Props for ActivityItem component
 */
interface ActivityItemProps {
  /** Activity event to display */
  activity: ActivityEvent;
  /** Current user's address for determining transaction direction */
  userAddress?: string;
}

/**
 * Get appropriate icon for activity event type
 */
const getEventIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'cbtc-mint':
    case 'cbtc-transfer':
      return <Coins className="w-4 h-4" />;
    case 'cnft-mint':
    case 'cnft-transfer':
      return <Image className="w-4 h-4" />;
    case 'profile-updated':
    case 'profile-cleared':
      return <User className="w-4 h-4" />;
    default:
      return <Coins className="w-4 h-4" />;
  }
};

/**
 * Get human-readable label for activity event type
 */
const getEventLabel = (type: ActivityEvent['type']): string => {
  switch (type) {
    case 'cbtc-mint': return 'cBTC Minted';
    case 'cbtc-transfer': return 'cBTC Transfer';
    case 'cnft-mint': return 'NFT Minted';
    case 'cnft-transfer': return 'NFT Transfer';
    case 'profile-updated': return 'Profile Updated';
    case 'profile-cleared': return 'Profile Cleared';
    default: return 'Unknown Activity';
  }
};

/**
 * Get color scheme for activity event type
 */
const getEventColor = (type: ActivityEvent['type']): string => {
  switch (type) {
    case 'cbtc-mint':
    case 'cnft-mint':
      return 'text-success bg-success/10 border-success/20';
    case 'cbtc-transfer':
    case 'cnft-transfer':
      return 'text-primary bg-primary/10 border-primary/20';
    case 'profile-updated':
    case 'profile-cleared':
      return 'text-accent bg-accent/10 border-accent/20';
    default:
      return 'text-muted-foreground bg-muted border-muted';
  }
};

/**
 * Calculate relative time from timestamp
 */
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

/**
 * ActivityItem Component
 *
 * Displays a single blockchain activity event with icon, description,
 * amount, and timestamp. Supports different event types and directions.
 */
export const ActivityItem = ({ activity, userAddress }: ActivityItemProps) => {
  const isOutgoing = activity.sender === userAddress;
  const timeAgo = getTimeAgo(new Date(activity.timestamp));
  const eventColor = getEventColor(activity.type);

  // Generate description based on event type
  const getDescription = (): string => {
    switch (activity.type) {
      case 'cbtc-transfer':
        if (isOutgoing) {
          return `Sent ${formatBalance(activity.amount || 0)} cBTC to ${truncateAddress(activity.recipient || '')}`;
        } else {
          return `Received ${formatBalance(activity.amount || 0)} cBTC from ${truncateAddress(activity.sender || '')}`;
        }
      case 'cbtc-mint':
        return `Minted ${formatBalance(activity.amount || 0)} cBTC`;
      case 'cnft-transfer':
        if (isOutgoing) {
          return `Transferred NFT #${activity.tokenId} to ${truncateAddress(activity.recipient || '')}`;
        } else {
          return `Received NFT #${activity.tokenId} from ${truncateAddress(activity.sender || '')}`;
        }
      case 'cnft-mint':
        return `Minted NFT #${activity.tokenId}`;
      case 'profile-updated':
        return 'Updated on-chain profile';
      case 'profile-cleared':
        return 'Cleared on-chain profile';
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors",
        eventColor
      )}
      role="article"
      aria-label={`${getEventLabel(activity.type)} at ${timeAgo}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg bg-background/50"
            aria-hidden="true"
          >
            {getEventIcon(activity.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">
                {getEventLabel(activity.type)}
              </h3>
              {isOutgoing && (
                <ArrowUpRight className="w-3 h-3 text-muted-foreground" aria-label="Outgoing transaction" />
              )}
              {!isOutgoing && activity.sender && (
                <ArrowDownLeft className="w-3 h-3 text-muted-foreground" aria-label="Incoming transaction" />
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {getDescription()}
            </p>

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>{timeAgo}</span>
              <span>•</span>
              <span>Block #{activity.blockHeight.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <a
          href={`${EXPLORER_URL}/txid/${activity.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-background/50 transition-colors"
          aria-label={`View transaction ${activity.txHash} on explorer`}
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>
    </div>
  );
};

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/20 transition-all animate-slide-up">
      <div className={cn("p-2 rounded-lg", getEventColor(event.type))}>
        {getEventIcon(event.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground">{getEventLabel(event.type)}</span>
          {(event.type === 'cbtc-transfer' || event.type === 'cnft-transfer') && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              isOutgoing ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
            )}>
              {isOutgoing ? 'Sent' : 'Received'}
            </span>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {event.amount && (
            <span className="font-mono">{(event.amount / 1e8).toFixed(4)} cBTC</span>
          )}
          {event.tokenId && (
            <span className="font-mono">Token #{event.tokenId}</span>
          )}
          {event.recipient && (
            <span className="ml-2">
              → {truncateAddress(event.recipient)}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted-foreground mb-1">{timeAgo}</p>
        <a
          href={`${EXPLORER_URL}/txid/${event.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 justify-end"
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
