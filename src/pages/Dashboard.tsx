import { useEffect, useState } from 'react';
import { Coins, Image, User, Activity as ActivityIcon, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ActivityItem } from '@/components/ActivityItem';
import { useWalletStore } from '@/store/walletStore';
import { getCBTCBalance, getProfile, formatBalance, truncateAddress } from '@/lib/stacks';
import { fetchActivity, ActivityEvent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Dashboard Page Component
 *
 * Main dashboard displaying user's cBTC balance, NFT count, profile info,
 * and recent blockchain activity. Requires wallet connection.
 */
export const Dashboard = () => {
  const { address, isConnected, network } = useWalletStore();
  const [cbtcBalance, setCbtcBalance] = useState(0);
  const [nftCount, setNftCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  /**
   * Load dashboard data from blockchain and API
   */
  const loadData = async (showLoading = true) => {
    if (!address) return;

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      console.log('Loading dashboard data for address:', address);

      const [balance, userProfile, activity] = await Promise.allSettled([
        getCBTCBalance(address),
        getProfile(address),
        fetchActivity({ address, limit: 10 }),
      ]);

      // Handle balance
      if (balance.status === 'fulfilled') {
        setCbtcBalance(balance.value);
        console.log('cBTC balance loaded:', balance.value);
      } else {
        console.error('Failed to load cBTC balance:', balance.reason);
        setError('Failed to load balance data');
      }

      // Handle profile
      if (userProfile.status === 'fulfilled') {
        setProfile(userProfile.value);
        console.log('Profile loaded:', userProfile.value);
      } else {
        console.error('Failed to load profile:', userProfile.reason);
      }

      // Handle activity
      if (activity.status === 'fulfilled') {
        setRecentActivity(activity.value);
        console.log('Activity loaded:', activity.value.length, 'events');
      } else {
        console.error('Failed to load activity:', activity.reason);
        setError('Failed to load activity data');
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when address changes
  useEffect(() => {
    if (address && isConnected) {
      loadData();
    } else {
      // Reset state when disconnected
      setCbtcBalance(0);
      setNftCount(0);
      setProfile(null);
      setRecentActivity([]);
      setError(null);
    }
  }, [address, isConnected]);

  // Auto-refresh data every 30 seconds when connected
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(() => {
      loadData(false); // Don't show loading spinner for auto-refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [address, isConnected]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    loadData(true);
  };

  // Show wallet connect prompt if not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="text-center space-y-4">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground mt-2">
              Connect your Hiro Wallet to view your dashboard and manage your assets
            </p>
          </div>
        </div>
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your CypherBTC overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="cBTC Balance"
          value={formatBalance(cbtcBalance)}
          icon={Coins}
          isLoading={isLoading}
          description="CypherBTC tokens"
        />
        <StatCard
          title="NFT Count"
          value={nftCount.toString()}
          icon={Image}
          isLoading={isLoading}
          description="CypherCollectibles owned"
        />
        <StatCard
          title="Network"
          value={network.toUpperCase()}
          icon={Wallet}
          description="Current network"
        />
        <StatCard
          title="Profile Status"
          value={profile ? "Active" : "Not Set"}
          icon={User}
          description="On-chain profile"
        />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>

        {isLoading && recentActivity.length === 0 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity found</p>
          </div>
        )}
      </div>
    </div>
  );
};
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
