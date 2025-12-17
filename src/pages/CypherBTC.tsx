import { useEffect, useState } from 'react';
import { Coins, Send, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/store/walletStore';
import { getCBTCBalance, formatBalance, truncateAddress } from '@/lib/stacks';
import { fetchActivity, ActivityEvent } from '@/lib/api';
import { ActivityItem } from '@/components/ActivityItem';
import { useToast } from '@/hooks/use-toast';

export const CypherBTC = () => {
  const { address, isConnected } = useWalletStore();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [transfers, setTransfers] = useState<ActivityEvent[]>([]);

  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      setIsLoading(true);
      try {
        const [bal, activity] = await Promise.all([
          getCBTCBalance(address),
          fetchActivity({ type: 'cbtc-transfer', address }),
        ]);
        setBalance(bal);
        setTransfers(activity.filter((e) => e.type.includes('cbtc')));
      } catch (error) {
        console.error('Error loading cBTC data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [address]);

  const handleTransfer = async () => {
    if (!address || !transferForm.recipient || !transferForm.amount) return;
    setIsSending(true);

    try {
      toast({
        title: 'Transaction Submitted',
        description: 'Waiting for wallet signature...',
      });

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Transfer Complete',
        description: `Successfully sent ${transferForm.amount} cBTC`,
      });

      setTransferForm({ recipient: '', amount: '' });
      
      // Refresh balance
      const newBalance = await getCBTCBalance(address);
      setBalance(newBalance);
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: 'Failed to transfer cBTC. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Connect your wallet to view your cBTC balance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Coins className="w-8 h-8 text-primary" />
          CypherBTC
        </h1>
        <p className="text-muted-foreground">
          View your cBTC balance and transfer tokens.
        </p>
      </div>

      {/* Balance Card */}
      <div className="p-8 rounded-xl bg-gradient-to-br from-card to-secondary/30 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gradient font-mono">
            {isLoading ? '...' : formatBalance(balance)}
          </span>
          <span className="text-xl text-muted-foreground">cBTC</span>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="p-6 rounded-xl bg-card border border-border space-y-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Transfer cBTC
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Recipient Address
            </label>
            <Input
              value={transferForm.recipient}
              onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
              placeholder="SP..."
              className="font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Amount (cBTC)
            </label>
            <Input
              type="number"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              placeholder="0.00"
              step="0.00000001"
              min="0"
            />
          </div>

          <Button
            onClick={handleTransfer}
            disabled={isSending || !transferForm.recipient || !transferForm.amount}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send cBTC
          </Button>
        </div>
      </div>

      {/* Recent Transfers */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-primary" />
          Recent Transfers
        </h2>

        {transfers.length > 0 ? (
          <div className="space-y-3">
            {transfers.map((event) => (
              <ActivityItem key={event.id} event={event} userAddress={address!} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recent transfers</p>
        )}
      </div>
    </div>
  );
};
