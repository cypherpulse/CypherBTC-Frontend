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
import { CONTRACTS, NETWORK, STACKS_API_URL } from './constants';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const getNetwork = () => {
  return NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
};

export const connectWallet = (onSuccess: (address: string, network: 'testnet' | 'mainnet') => void) => {
  showConnect({
    appDetails: {
      name: 'CypherBoard',
      icon: window.location.origin + '/favicon.ico',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      const address = NETWORK === 'mainnet' 
        ? userData.profile.stxAddress.mainnet 
        : userData.profile.stxAddress.testnet;
      onSuccess(address, NETWORK as 'testnet' | 'mainnet');
    },
    userSession,
  });
};

export const disconnectWallet = () => {
  userSession.signUserOut('/');
};

// Read-only contract calls
export const getProfile = async (address: string) => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACTS.profiles.address,
      contractName: CONTRACTS.profiles.name,
      functionName: 'get-profile',
      functionArgs: [standardPrincipalCV(address)],
      network: getNetwork(),
      senderAddress: address,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const getCBTCBalance = async (address: string): Promise<number> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACTS.cypherBTC.address,
      contractName: CONTRACTS.cypherBTC.name,
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(address)],
      network: getNetwork(),
      senderAddress: address,
    });
    const value = cvToValue(result);
    return typeof value === 'object' && value.value ? Number(value.value) : Number(value) || 0;
  } catch (error) {
    console.error('Error fetching cBTC balance:', error);
    return 0;
  }
};

export const getLastTokenId = async (): Promise<number> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACTS.cypherCollectibles.address,
      contractName: CONTRACTS.cypherCollectibles.name,
      functionName: 'get-last-token-id',
      functionArgs: [],
      network: getNetwork(),
      senderAddress: CONTRACTS.cypherCollectibles.address,
    });
    const value = cvToValue(result);
    return typeof value === 'object' && value.value ? Number(value.value) : Number(value) || 0;
  } catch (error) {
    console.error('Error fetching last token ID:', error);
    return 0;
  }
};

export const getNFTOwner = async (tokenId: number): Promise<string | null> => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACTS.cypherCollectibles.address,
      contractName: CONTRACTS.cypherCollectibles.name,
      functionName: 'get-owner',
      functionArgs: [uintCV(tokenId)],
      network: getNetwork(),
      senderAddress: CONTRACTS.cypherCollectibles.address,
    });
    const value = cvToValue(result);
    return value?.value || null;
  } catch (error) {
    console.error('Error fetching NFT owner:', error);
    return null;
  }
};

export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatBalance = (balance: number, decimals = 8): string => {
  return (balance / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
};
