import { WalletConnect } from '@/components/WalletConnect';
import { NetworkBadge } from '@/components/NetworkBadge';

export const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground hidden md:block">CypherBoard</h1>
          <NetworkBadge />
        </div>
        <WalletConnect />
      </div>
    </header>
  );
};
