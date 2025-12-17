import { useEffect, useState } from 'react';
import { Image, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NFTCard } from '@/components/NFTCard';
import { useWalletStore } from '@/store/walletStore';
import { getLastTokenId, getNFTOwner } from '@/lib/stacks';
import { CONTRACTS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NFT {
  tokenId: number;
  owner: string;
}

export const Collectibles = () => {
  const { address, isConnected } = useWalletStore();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintRecipient, setMintRecipient] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [mintDialogOpen, setMintDialogOpen] = useState(false);

  useEffect(() => {
    const loadNFTs = async () => {
      if (!address) return;
      setIsLoading(true);
      try {
        // Check if user is contract owner
        setIsOwner(address === CONTRACTS.cypherCollectibles.address);

        // Get last token ID
        const lastTokenId = await getLastTokenId();
        
        // For demo, show some mock owned NFTs
        // In production, you'd iterate through tokens or use a backend indexer
        const ownedNFTs: NFT[] = [
          { tokenId: 1, owner: address },
          { tokenId: 7, owner: address },
          { tokenId: 15, owner: address },
        ];
        
        setNfts(ownedNFTs);
      } catch (error) {
        console.error('Error loading NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNFTs();
  }, [address]);

  const handleMint = async () => {
    if (!mintRecipient) return;
    setIsMinting(true);

    try {
      toast({
        title: 'Minting NFT',
        description: 'Waiting for wallet signature...',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'NFT Minted!',
        description: `Successfully minted a new CypherCollectible`,
      });

      setMintRecipient('');
      setMintDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Mint Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleTransfer = async (tokenId: number, recipient: string) => {
    toast({
      title: 'Transferring NFT',
      description: 'Waiting for wallet signature...',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: 'Transfer Complete',
      description: `NFT #${tokenId} has been transferred`,
    });

    // Remove from local state
    setNfts(nfts.filter((nft) => nft.tokenId !== tokenId));
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Connect your wallet to view your NFT collection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Image className="w-8 h-8 text-primary" />
            CypherCollectibles
          </h1>
          <p className="text-muted-foreground">
            Your NFT collection on Stacks.
          </p>
        </div>

        {isOwner && (
          <Dialog open={mintDialogOpen} onOpenChange={setMintDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Mint NFT
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Mint New NFT</DialogTitle>
                <DialogDescription>
                  As the contract owner, you can mint new CypherCollectibles.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Recipient Address
                  </label>
                  <Input
                    value={mintRecipient}
                    onChange={(e) => setMintRecipient(e.target.value)}
                    placeholder="SP..."
                    className="font-mono"
                  />
                </div>
                <Button
                  onClick={handleMint}
                  disabled={!mintRecipient || isMinting}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isMinting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Mint NFT
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* NFT Gallery */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              tokenId={nft.tokenId}
              owner={nft.owner}
              onTransfer={handleTransfer}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Image className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No NFTs Yet</h2>
          <p className="text-muted-foreground">
            You don't own any CypherCollectibles yet.
          </p>
        </div>
      )}
    </div>
  );
};
