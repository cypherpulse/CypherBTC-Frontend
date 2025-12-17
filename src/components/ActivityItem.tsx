import { ArrowUpRight, ArrowDownLeft, Coins, Image, User, ExternalLink } from 'lucide-react';
import { ActivityEvent } from '@/lib/api';
import { truncateAddress } from '@/lib/stacks';
import { EXPLORER_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  event: ActivityEvent;
  userAddress?: string;
}

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

const getEventLabel = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'cbtc-mint': return 'cBTC Mint';
    case 'cbtc-transfer': return 'cBTC Transfer';
    case 'cnft-mint': return 'NFT Mint';
    case 'cnft-transfer': return 'NFT Transfer';
    case 'profile-updated': return 'Profile Updated';
    case 'profile-cleared': return 'Profile Cleared';
    default: return 'Unknown';
  }
};

const getEventColor = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'cbtc-mint':
    case 'cnft-mint':
      return 'text-success bg-success/10';
    case 'cbtc-transfer':
    case 'cnft-transfer':
      return 'text-primary bg-primary/10';
    case 'profile-updated':
    case 'profile-cleared':
      return 'text-accent bg-accent/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export const ActivityItem = ({ event, userAddress }: ActivityItemProps) => {
  const isOutgoing = event.sender === userAddress;
  const timeAgo = getTimeAgo(new Date(event.timestamp));

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
