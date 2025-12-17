import { useEffect, useState } from 'react';
import { Coins, Image, User, Activity as ActivityIcon, Wallet } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ActivityItem } from '@/components/ActivityItem';
import { useWalletStore } from '@/store/walletStore';
import { getCBTCBalance, getProfile, formatBalance, truncateAddress } from '@/lib/stacks';
import { fetchActivity, ActivityEvent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';

export const Dashboard = () => {
  const { address, isConnected, network } = useWalletStore();
  const [cbtcBalance, setCbtcBalance] = useState(0);
  const [nftCount, setNftCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      setIsLoading(true);
      try {
        const [balance, userProfile, activity] = await Promise.all([
          getCBTCBalance(address),
          getProfile(address),
          fetchActivity({ address }),
        ]);
        setCbtcBalance(balance);
        setProfile(userProfile);
        setRecentActivity(activity.slice(0, 5));
        // NFT count would come from backend indexer in production
        setNftCount(3);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse-glow">
          <Wallet className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to CypherBoard</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Connect your Hiro Wallet to view your cBTC balance, NFT collection, and on-chain profile.
        </p>
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Connected as <span className="font-mono text-primary">{truncateAddress(address!, 6)}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="cBTC Balance"
          value={formatBalance(cbtcBalance)}
          icon={<Coins className="w-5 h-5" />}
          subtitle="CypherBTC"
          trend="neutral"
        />
        <StatCard
          title="NFTs Owned"
          value={nftCount}
          icon={<Image className="w-5 h-5" />}
          subtitle="CypherCollectibles"
        />
        <StatCard
          title="Profile Status"
          value={profile ? 'Active' : 'Not Set'}
          icon={<User className="w-5 h-5" />}
          subtitle={profile?.displayName || 'Set up your profile'}
        />
        <StatCard
          title="Network"
          value={network.toUpperCase()}
          icon={<ActivityIcon className="w-5 h-5" />}
          subtitle="Stacks Blockchain"
        />
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium text-foreground">{profile.firstName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium text-foreground">{profile.lastName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="font-medium text-foreground">{profile.displayName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bio</p>
              <p className="font-medium text-foreground truncate">{profile.bio || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-primary" />
          Recent Activity
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((event) => (
              <ActivityItem key={event.id} event={event} userAddress={address!} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};
