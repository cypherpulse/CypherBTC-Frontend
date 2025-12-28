import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Supported Stacks networks
 */
export type StacksNetwork = 'testnet' | 'mainnet';

/**
 * Wallet connection state interface
 */
interface WalletState {
  /** User's Stacks address */
  address: string | null;
  /** Current network (testnet/mainnet) */
  network: StacksNetwork;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Timestamp of last connection */
  lastConnectedAt: number | null;
  /** Set wallet connection details */
  setWallet: (address: string, network: StacksNetwork) => void;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Set connecting state */
  setConnecting: (connecting: boolean) => void;
  /** Check if wallet is still valid */
  isWalletValid: () => boolean;
}

/**
 * Wallet store for managing Hiro Wallet connection state
 *
 * Uses Zustand with persistence to maintain wallet state across sessions.
 * Automatically clears invalid connections and provides type-safe state management.
 */
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      network: 'testnet' as StacksNetwork,
      isConnected: false,
      isConnecting: false,
      lastConnectedAt: null,

      setWallet: (address, network) => {
        console.log('Setting wallet:', { address, network });
        set({
          address,
          network,
          isConnected: true,
          isConnecting: false,
          lastConnectedAt: Date.now()
        });
      },

      disconnect: () => {
        console.log('Disconnecting wallet');
        set({
          address: null,
          isConnected: false,
          isConnecting: false,
          lastConnectedAt: null
        });
      },

      setConnecting: (connecting) => {
        console.log('Setting connecting state:', connecting);
        set({ isConnecting: connecting });
      },

      isWalletValid: () => {
        const state = get();
        if (!state.isConnected || !state.address || !state.lastConnectedAt) {
          return false;
        }

        // Check if connection is older than 24 hours (basic validity check)
        const oneDay = 24 * 60 * 60 * 1000;
        return Date.now() - state.lastConnectedAt < oneDay;
      },
    }),
    {
      name: 'cypherbtc-wallet',
      // Only persist essential connection data
      partialize: (state) => ({
        address: state.address,
        network: state.network,
        isConnected: state.isConnected,
        lastConnectedAt: state.lastConnectedAt,
      }),
    }
  )
);
