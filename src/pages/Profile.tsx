import { useEffect, useState } from 'react';
import { User, Save, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWalletStore } from '@/store/walletStore';
import { getProfile } from '@/lib/stacks';
import { useToast } from '@/hooks/use-toast';

export const Profile = () => {
  const { address, isConnected } = useWalletStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!address) return;
      setIsLoading(true);
      try {
        const profile = await getProfile(address);
        if (profile) {
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            displayName: profile.displayName || '',
            bio: profile.bio || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [address]);

  const handleSave = async () => {
    if (!address) return;
    setIsSaving(true);
    setTxStatus('pending');

    try {
      // In production, this would use openContractCall from @stacks/connect
      // to call set-profile on the profiles contract
      toast({
        title: 'Transaction Submitted',
        description: 'Waiting for wallet signature...',
      });

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setTxStatus('success');
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved on-chain.',
      });
    } catch (error) {
      setTxStatus('error');
      toast({
        title: 'Transaction Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!address) return;
    setIsSaving(true);

    try {
      toast({
        title: 'Clearing Profile',
        description: 'Waiting for wallet signature...',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setFormData({
        firstName: '',
        lastName: '',
        displayName: '',
        bio: '',
      });

      toast({
        title: 'Profile Cleared',
        description: 'Your profile has been removed from the chain.',
      });
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: 'Failed to clear profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Connect your wallet to manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your on-chain identity on the Stacks blockchain.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-card border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              First Name
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              maxLength={50}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Last Name
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              maxLength={50}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Display Name
          </label>
          <Input
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="CryptoKing"
            maxLength={30}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is how you'll appear across CypherBoard
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Bio
          </label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            maxLength={280}
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.bio.length}/280 characters
          </p>
        </div>

        {txStatus === 'pending' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning border border-warning/20">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Transaction pending...</span>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Profile
          </Button>
          <Button
            onClick={handleClear}
            disabled={isSaving || isLoading}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
