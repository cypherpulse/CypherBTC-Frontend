/**
 * CypherBTC Frontend Constants
 *
 * Centralized configuration for the CypherBTC dApp including contract addresses,
 * network settings, API endpoints, and application constants.
 */

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

/**
 * Current Stacks network (mainnet or testnet)
 * Defaults to testnet for development
 */
export const NETWORK = (import.meta.env.VITE_STACKS_NETWORK || 'testnet') as 'mainnet' | 'testnet';

/**
 * Network-specific configuration
 */
export const NETWORK_CONFIG = {
  mainnet: {
    apiUrl: 'https://stacks-node-api.mainnet.stacks.co',
    explorerUrl: 'https://explorer.stacks.co',
    name: 'Mainnet',
  },
  testnet: {
    apiUrl: 'https://stacks-node-api.testnet.stacks.co',
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    name: 'Testnet',
  },
} as const;

/**
 * Current network API URL
 */
export const STACKS_API_URL = NETWORK_CONFIG[NETWORK].apiUrl;

/**
 * Current network explorer URL
 */
export const EXPLORER_URL = NETWORK_CONFIG[NETWORK].explorerUrl;

// ============================================================================
// SMART CONTRACT CONFIGURATION
// ============================================================================

/**
 * Smart contract addresses and names for CypherBTC ecosystem
 * All contracts are configurable via environment variables
 */
export const CONTRACTS = {
  /** User profiles contract for on-chain identity */
  profiles: {
    address: import.meta.env.VITE_PROFILES_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: import.meta.env.VITE_PROFILES_CONTRACT_NAME || 'profiles',
  },
  /** CypherBTC token contract for cBTC operations */
  cypherBTC: {
    address: import.meta.env.VITE_CYPHERBTC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: import.meta.env.VITE_CYPHERBTC_CONTRACT_NAME || 'cypher-btc',
  },
  /** NFT collectibles contract for CypherCollectibles */
  cypherCollectibles: {
    address: import.meta.env.VITE_COLLECTIBLES_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: import.meta.env.VITE_COLLECTIBLES_CONTRACT_NAME || 'cypher-collectibles',
  },
} as const;

/**
 * Contract deployment status
 */
export const CONTRACT_STATUS = {
  profiles: 'deployed',
  cypherBTC: 'deployed',
  cypherCollectibles: 'deployed',
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Backend API base URL
 * Defaults to localhost for development
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  activity: '/api/activity',
  profiles: '/api/profiles',
  tokens: '/api/tokens',
  collectibles: '/api/collectibles',
  health: '/api/health',
} as const;

// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'CypherBTC Frontend',
  version: '1.0.0',
  description: 'A React dApp for the Stacks blockchain ecosystem',
  author: 'CypherBTC Team',
} as const;

/**
 * UI/UX constants
 */
export const UI_CONFIG = {
  /** Default number of items per page */
  itemsPerPage: 20,
  /** Maximum retry attempts for failed operations */
  maxRetries: 3,
  /** Toast notification duration in milliseconds */
  toastDuration: 5000,
  /** Animation durations */
  animationDuration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;

/**
 * Token and currency constants
 */
export const TOKEN_CONFIG = {
  /** CypherBTC token decimals */
  cbtcDecimals: 8,
  /** MicroStacks per STX */
  microStacksPerSTX: 1000000,
  /** Minimum transaction amount */
  minTransactionAmount: 1000, // in micro-units
} as const;

/**
 * Time constants in milliseconds
 */
export const TIME_CONFIG = {
  /** Session timeout */
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  /** Cache expiration */
  cacheExpiration: 5 * 60 * 1000, // 5 minutes
  /** API request timeout */
  apiTimeout: 30 * 1000, // 30 seconds
  /** Wallet connection timeout */
  walletTimeout: 60 * 1000, // 60 seconds
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  walletNotConnected: 'Please connect your Hiro Wallet to continue',
  networkMismatch: 'Network mismatch. Please switch to the correct network',
  transactionFailed: 'Transaction failed. Please try again',
  insufficientFunds: 'Insufficient funds for this transaction',
  contractError: 'Smart contract error. Please contact support',
  apiError: 'API error. Please try again later',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  walletConnected: 'Wallet connected successfully',
  transactionSubmitted: 'Transaction submitted successfully',
  profileUpdated: 'Profile updated successfully',
  tokenTransferred: 'Token transferred successfully',
} as const;

// ============================================================================
// EXTERNAL LINKS
// ============================================================================

/**
 * External service URLs
 */
export const EXTERNAL_LINKS = {
  /** Hiro Wallet download */
  hiroWallet: 'https://wallet.hiro.so',
  /** Stacks documentation */
  stacksDocs: 'https://docs.stacks.co',
  /** CypherBTC documentation */
  cypherBTCDocs: 'https://docs.cypherbtc.com',
  /** GitHub repository */
  github: 'https://github.com/cypherbtc/cypherbtc-frontend',
  /** Discord community */
  discord: 'https://discord.gg/cypherbtc',
} as const;
