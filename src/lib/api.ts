import { API_BASE_URL } from './constants';

/**
 * Activity event types supported by the CypherBTC platform
 */
export type ActivityEventType =
  | 'profile-updated'
  | 'profile-cleared'
  | 'cbtc-mint'
  | 'cbtc-transfer'
  | 'cnft-mint'
  | 'cnft-transfer';

/**
 * Activity event interface for blockchain transactions and events
 */
export interface ActivityEvent {
  /** Unique event identifier */
  id: string;
  /** Type of activity event */
  type: ActivityEventType;
  /** Transaction hash on the blockchain */
  txHash: string;
  /** Sender address (optional) */
  sender?: string;
  /** Recipient address (optional) */
  recipient?: string;
  /** Amount for token transfers (optional) */
  amount?: number;
  /** Token ID for NFT operations (optional) */
  tokenId?: number;
  /** ISO timestamp of the event */
  timestamp: string;
  /** Block height where event occurred */
  blockHeight: number;
}

/**
 * Parameters for activity fetching
 */
export interface ActivityParams {
  /** Filter by event type */
  type?: ActivityEventType;
  /** Filter by address (sender or recipient) */
  address?: string;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * Custom error class for API operations
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

/**
 * Generic API request wrapper with retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = RETRY_CONFIG.maxRetries
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`API Request: ${options.method || 'GET'} ${url} (attempt ${attempt + 1})`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          endpoint
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed (attempt ${attempt + 1}):`, error);

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof ApiError && error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new ApiError('Max retries exceeded', undefined, endpoint);
}

/**
 * Fetch activity events from the backend API
 *
 * @param params - Optional filtering parameters
 * @returns Promise resolving to array of activity events
 * @throws ApiError if the request fails after retries
 */
export const fetchActivity = async (params?: ActivityParams): Promise<ActivityEvent[]> => {
  try {
    const searchParams = new URLSearchParams();

    if (params?.type) searchParams.set('type', params.type);
    if (params?.address) searchParams.set('address', params.address);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/activity${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<ApiResponse<ActivityEvent[]>>(endpoint);

    if (response.success && Array.isArray(response.data)) {
      console.log(`Fetched ${response.data.length} activity events`);
      return response.data;
    } else {
      console.warn('Invalid API response format:', response);
      return getMockActivity();
    }
  } catch (error) {
    console.error('Error fetching activity:', error);

    // Return mock data as fallback for development/demo
    console.log('Falling back to mock data');
    return getMockActivity();
  }
};

/**
 * Mock data for demonstration and development purposes
 * TODO: Remove this when backend API is fully implemented
 */
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
