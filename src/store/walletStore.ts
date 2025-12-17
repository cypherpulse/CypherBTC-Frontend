import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  network: 'testnet' | 'mainnet';
  isConnected: boolean;
  isConnecting: boolean;
  setWallet: (address: string, network: 'testnet' | 'mainnet') => void;
  disconnect: () => void;
  setConnecting: (connecting: boolean) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      network: 'testnet',
      isConnected: false,
      isConnecting: false,
      setWallet: (address, network) =>
        set({ address, network, isConnected: true, isConnecting: false }),
      disconnect: () =>
        set({ address: null, isConnected: false, isConnecting: false }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
    }),
    {
      name: 'cypherboard-wallet',
    }
  )
);
