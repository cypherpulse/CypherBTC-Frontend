// Contract configuration - set via environment variables
export const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';

export const CONTRACTS = {
  profiles: {
    address: import.meta.env.VITE_PROFILES_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: import.meta.env.VITE_PROFILES_CONTRACT_NAME || 'profiles',
  },
  cypherBTC: {
    address: import.meta.env.VITE_CYPHERBTC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: import.meta.env.VITE_CYPHERBTC_CONTRACT_NAME || 'cypher-btc',
  },
  cypherCollectibles: {
    address: import.meta.env.VITE_COLLECTIBLES_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: import.meta.env.VITE_COLLECTIBLES_CONTRACT_NAME || 'cypher-collectibles',
  },
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const STACKS_API_URL = NETWORK === 'mainnet' 
  ? 'https://stacks-node-api.mainnet.stacks.co'
  : 'https://stacks-node-api.testnet.stacks.co';

export const EXPLORER_URL = NETWORK === 'mainnet'
  ? 'https://explorer.stacks.co'
  : 'https://explorer.stacks.co/?chain=testnet';
