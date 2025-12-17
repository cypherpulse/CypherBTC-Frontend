import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/walletStore';
import { connectWallet, disconnectWallet, truncateAddress } from '@/lib/stacks';
import { NETWORK } from '@/lib/constants';

export const WalletConnect = () => {
  const { address, isConnected, isConnecting, setWallet, disconnect, setConnecting } = useWalletStore();

  const handleConnect = () => {
    setConnecting(true);
    connectWallet((addr, net) => {
      setWallet(addr, net);
    });
  };

  const handleDisconnect = () => {
    disconnectWallet();
    disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-border">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-sm text-foreground">{truncateAddress(address)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      Connect Wallet
    </Button>
  );
};
