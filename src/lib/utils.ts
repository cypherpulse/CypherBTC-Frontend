import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = '$', decimals = 2): string {
  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format a large number with K/M/B suffixes
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export function formatCompactNumber(num: number, decimals = 1): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toString();
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Debounce a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a value is a valid Ethereum address (basic validation)
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if a value is a valid Stacks address (basic validation)
 * @param address - Address to validate
 * @returns True if valid Stacks address
 */
export function isValidStacksAddress(address: string): boolean {
  return /^S[PM][A-Z0-9]{38,39}$/.test(address);
}

/**
 * Generate a random ID string
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Format file size in human readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Sleep/delay utility
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if code is running on the client side
 * @returns True if running in browser
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if code is running on the server side
 * @returns True if running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get the current timestamp in ISO format
 * @returns ISO timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
