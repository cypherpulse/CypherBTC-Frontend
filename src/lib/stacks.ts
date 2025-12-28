import { AppConfig, showConnect, UserSession } from '@stacks/connect';
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  standardPrincipalCV,
  uintCV,
  Pc,
  ClarityValue,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { CONTRACTS, NETWORK, STACKS_API_URL, APP_CONFIG } from './constants';

/**
 * Stacks Blockchain Integration Utilities
 *
 * This module provides utilities for interacting with the Stacks blockchain,
 * including wallet connection, contract calls, and data formatting.
 */

// ============================================================================
// WALLET CONFIGURATION
// ============================================================================

/**
 * Application configuration for Stacks Connect
 * Defines the permissions required by the dApp
 */
const appConfig = new AppConfig(['store_write', 'publish_data']);

/**
 * User session instance for managing wallet connections
 */
export const userSession = new UserSession({ appConfig });

/**
 * Get the current Stacks network instance
 * @returns STACKS_MAINNET or STACKS_TESTNET based on current configuration
 */
export const getNetwork = () => {
  return NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
};

/**
 * Connect Hiro Wallet
 * @param onSuccess - Callback function called with address and network on successful connection
 * @throws Error if wallet connection fails
 */
export const connectWallet = (
  onSuccess: (address: string, network: 'testnet' | 'mainnet') => void
) => {
  try {
    showConnect({
      appDetails: {
        name: APP_CONFIG.name,
        icon: `${window.location.origin}/favicon.ico`,
      },
      redirectTo: '/',
      onFinish: () => {
        try {
          const userData = userSession.loadUserData();
          const address = NETWORK === 'mainnet'
            ? userData.profile.stxAddress.mainnet
            : userData.profile.stxAddress.testnet;

          if (!address) {
            throw new Error('Unable to retrieve wallet address');
          }

          console.log('Wallet connected successfully:', { address, network: NETWORK });
          onSuccess(address, NETWORK as 'testnet' | 'mainnet');
        } catch (error) {
          console.error('Error processing wallet connection:', error);
          throw new Error('Failed to process wallet connection');
        }
      },
      userSession,
    });
  } catch (error) {
    console.error('Error initiating wallet connection:', error);
    throw new Error('Failed to initiate wallet connection');
  }
};

/**
 * Disconnect Hiro Wallet
 * Signs out the current user session
 */
export const disconnectWallet = () => {
  try {
    userSession.signUserOut('/');
    console.log('Wallet disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};

// ============================================================================
// CONTRACT INTERACTION FUNCTIONS
// ============================================================================

/**
 * Generic contract call wrapper with error handling
 */
async function callReadOnlyFunction(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[] = [],
  senderAddress: string
): Promise<any> {
  try {
    console.log(`Calling ${contractName}.${functionName} with args:`, functionArgs);

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      network: getNetwork(),
      senderAddress,
    });

    const value = cvToValue(result);
    console.log(`${functionName} result:`, value);
    return value;
  } catch (error) {
    console.error(`Error calling ${contractName}.${functionName}:`, error);
    throw new Error(`Contract call failed: ${functionName}`);
  }
}

/**
 * Get user profile from the profiles contract
 * @param address - Stacks address to query
 * @returns User profile data or null if not found
 */
export const getProfile = async (address: string) => {
  try {
    return await callReadOnlyFunction(
      CONTRACTS.profiles.address,
      CONTRACTS.profiles.name,
      'get-profile',
      [standardPrincipalCV(address)],
      address
    );
  } catch (error) {
    console.warn('Profile not found or error fetching profile:', error);
    return null;
  }
};

/**
 * Get CypherBTC balance for an address
 * @param address - Stacks address to query
 * @returns Balance in micro-units (uBTC)
 */
export const getCBTCBalance = async (address: string): Promise<number> => {
  try {
    const result = await callReadOnlyFunction(
      CONTRACTS.cypherBTC.address,
      CONTRACTS.cypherBTC.name,
      'get-balance',
      [standardPrincipalCV(address)],
      address
    );

    // Handle different response formats from Clarity contracts
    if (typeof result === 'object' && result.value) {
      return Number(result.value);
    }
    return Number(result) || 0;
  } catch (error) {
    console.warn('Error fetching cBTC balance, returning 0:', error);
    return 0;
  }
};

/**
 * Get the last minted token ID from the collectibles contract
 * @returns Last token ID number
 */
export const getLastTokenId = async (): Promise<number> => {
  try {
    const result = await callReadOnlyFunction(
      CONTRACTS.cypherCollectibles.address,
      CONTRACTS.cypherCollectibles.name,
      'get-last-token-id',
      [],
      CONTRACTS.cypherCollectibles.address
    );

    if (typeof result === 'object' && result.value) {
      return Number(result.value);
    }
    return Number(result) || 0;
  } catch (error) {
    console.warn('Error fetching last token ID, returning 0:', error);
    return 0;
  }
};

/**
 * Get the owner of a specific NFT token
 * @param tokenId - Token ID to query
 * @returns Owner address or null if not found
 */
export const getNFTOwner = async (tokenId: number): Promise<string | null> => {
  try {
    const result = await callReadOnlyFunction(
      CONTRACTS.cypherCollectibles.address,
      CONTRACTS.cypherCollectibles.name,
      'get-owner',
      [uintCV(tokenId)],
      CONTRACTS.cypherCollectibles.address
    );

    return result?.value || null;
  } catch (error) {
    console.warn(`Error fetching NFT owner for token ${tokenId}:`, error);
    return null;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Truncate a Stacks address for display purposes
 * @param address - Full Stacks address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Truncated address string
 */
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format a balance with proper decimal places
 * @param balance - Balance in micro-units
 * @param decimals - Number of decimal places (default: 8 for BTC)
 * @returns Formatted balance string
 */
export const formatBalance = (balance: number, decimals = 8): string => {
  if (typeof balance !== 'number' || isNaN(balance)) return '0.00';

  const value = balance / Math.pow(10, decimals);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
};

/**
 * Convert STX to microSTX
 * @param stx - Amount in STX
 * @returns Amount in microSTX
 */
export const stxToMicroStx = (stx: number): number => {
  return Math.floor(stx * 1000000);
};

/**
 * Convert microSTX to STX
 * @param microStx - Amount in microSTX
 * @returns Amount in STX
 */
export const microStxToStx = (microStx: number): number => {
  return microStx / 1000000;
};

/**
 * Validate a Stacks address format
 * @param address - Address to validate
 * @returns True if address is valid
 */
export const isValidStacksAddress = (address: string): boolean => {
  // Basic validation for Stacks addresses
  return /^S[PM][A-Z0-9]{38,39}$/.test(address);
};

/**
 * Generate explorer URL for a transaction
 * @param txId - Transaction ID
 * @returns Full explorer URL
 */
export const getExplorerTxUrl = (txId: string): string => {
  return `${STACKS_API_URL.replace('stacks-node-api', 'explorer')}/txid/${txId}`;
};
