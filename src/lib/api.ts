import { API_BASE_URL } from './constants';

export interface ActivityEvent {
  id: string;
  type: 'profile-updated' | 'profile-cleared' | 'cbtc-mint' | 'cbtc-transfer' | 'cnft-mint' | 'cnft-transfer';
  txHash: string;
  sender?: string;
  recipient?: string;
  amount?: number;
  tokenId?: number;
  timestamp: string;
  blockHeight: number;
}

export const fetchActivity = async (params?: { type?: string; address?: string }): Promise<ActivityEvent[]> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.address) searchParams.set('address', params.address);
    
    const url = `${API_BASE_URL}/api/activity${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching activity:', error);
    // Return mock data for demo purposes
    return getMockActivity();
  }
};

// Mock data for demonstration
const getMockActivity = (): ActivityEvent[] => [
  {
    id: '1',
    type: 'cbtc-transfer',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    sender: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    recipient: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    amount: 50000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    blockHeight: 125430,
  },
  {
    id: '2',
    type: 'cnft-mint',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    tokenId: 42,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    blockHeight: 125425,
  },
  {
    id: '3',
    type: 'profile-updated',
    txHash: '0x567890abcdef1234567890abcdef1234567890ab',
    sender: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    blockHeight: 125420,
  },
  {
    id: '4',
    type: 'cbtc-mint',
    txHash: '0xcdef1234567890abcdef1234567890abcdef1234',
    recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    amount: 100000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    blockHeight: 125400,
  },
  {
    id: '5',
    type: 'cnft-transfer',
    txHash: '0x890abcdef1234567890abcdef1234567890abcde',
    sender: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    recipient: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
    tokenId: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    blockHeight: 125380,
  },
];
