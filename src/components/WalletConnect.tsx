import { Wallet, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/walletStore';
import { connectWallet, disconnectWallet, truncateAddress } from '@/lib/stacks';
import { NETWORK } from '@/lib/constants';
import { useState } from 'react';

/**
 * WalletConnect Component
 *
 * Provides wallet connection functionality for the CypherBTC dApp.
 * Handles Hiro Wallet integration with proper error handling and user feedback.
 */
export const WalletConnect = () => {
  const { address, isConnected, isConnecting, setWallet, disconnect, setConnecting } = useWalletStore();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      setConnecting(true);
      await connectWallet((addr, net) => {
        setWallet(addr, net);
        console.log('Wallet connected:', { address: addr, network: net });
      });
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnectWallet();
      disconnect();
      setError(null);
      console.log('Wallet disconnected');
    } catch (err) {
      console.error('Wallet disconnection failed:', err);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-border"
          role="status"
          aria-label={`Connected to ${NETWORK} network`}
        >
          <div
            className="w-2 h-2 rounded-full bg-success animate-pulse"
            aria-hidden="true"
          />
          <span className="font-mono text-sm text-foreground" aria-label={`Wallet address: ${address}`}>
            {truncateAddress(address)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Disconnect wallet"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
        aria-label={isConnecting ? "Connecting wallet..." : "Connect Hiro Wallet"}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        ) : (
          <Wallet className="w-4 h-4 mr-2" aria-hidden="true" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
