import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NFTCardProps {
  tokenId: number;
  owner: string;
  imageUrl?: string;
  name?: string;
  onTransfer: (tokenId: number, recipient: string) => Promise<void>;
}

export const NFTCard = ({ tokenId, owner, imageUrl, name, onTransfer }: NFTCardProps) => {
  const [recipient, setRecipient] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTransfer = async () => {
    if (!recipient) return;
    setIsTransferring(true);
    try {
      await onTransfer(tokenId, recipient);
      setIsOpen(false);
      setRecipient('');
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in">
      {/* NFT Image */}
      <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={name || `Token #${tokenId}`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl font-bold text-gradient">#{tokenId}</div>
        )}
      </div>

      {/* NFT Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">
          {name || `CypherCollectible #${tokenId}`}
        </h3>
        <p className="text-sm text-muted-foreground font-mono">Token ID: {tokenId}</p>
      </div>

      {/* Transfer Button */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="w-4 h-4 mr-2" />
              Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Transfer NFT #{tokenId}</DialogTitle>
              <DialogDescription>
                Enter the recipient's Stacks address to transfer this NFT.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Recipient Address
                </label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="SP..."
                  className="font-mono"
                />
              </div>
              <Button
                onClick={handleTransfer}
                disabled={!recipient || isTransferring}
                className="w-full bg-primary text-primary-foreground"
              >
                {isTransferring ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Confirm Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
