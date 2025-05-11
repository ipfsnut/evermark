// src/config/constants.ts
// Base URL for API endpoints  
const API_BASE = '/.netlify/functions';

export const AUTH_CONSTANTS = {
  SESSION_TOKEN_KEY: 'evermark_session_token',
  NONCE_LENGTH: 16,
  SESSION_DURATION_DAYS: 7
};

export const TOKEN_CONSTANTS = {
  WELCOME_BONUS: 5,
  DAILY_LIMIT: 100,
  TRANSACTION_TYPES: {
    WELCOME: 'welcome',
    STAKE: 'stake',
    REWARD: 'reward',
    ADMIN: 'admin'
  }
};

export const API_ENDPOINTS = {
  AUTH: `${API_BASE}/auth`,
  USER: `${API_BASE}/user`,
  TOKEN_BALANCE: `${API_BASE}/token-balance`,
  AWARD_TOKENS: `${API_BASE}/award-tokens`,
  EVERMARKS: `${API_BASE}/evermarks`,
  BISAC_CODES: '/.netlify/functions/bisac-codes'
};

// Contract addresses for the existing Bookmark protocol (used as Evermark)
export const CONTRACT_ADDRESSES = {
  NSI_TOKEN: '0x1696688A7828E227E64953C371aC0B57d5974B55',
  CARD_CATALOG: '0xB392f24dE4e1884cd21138Ca29fF4752c6478c7f',
  BOOKMARK_NFT: '0xA08EeEDeF615efDEE380c87F1Adc8998360f0e9a',
  BOOKMARK_VOTING: '0xb07a130a057A7A8B6bE63722D95518B08B7B069D',
  BOOKMARK_LEADERBOARD: '0x724c952C0492dEC405201937006bB48f366E6C22',
  BOOKMARK_REWARDS: '0x3205fe573AEdCD3026d085D9056Db8ae0488B390',
  BOOKMARK_AUCTION: '0x8a927E063d32e46cDeDe59DeC7BbF3be06316449',
  
  // Aliases for consistency
  EVERMARK_NFT: '0xA08EeEDeF615efDEE380c87F1Adc8998360f0e9a',
  EVERMARK_VOTING: '0xb07a130a057A7A8B6bE63722D95518B08B7B069D',
  EVERMARK_LEADERBOARD: '0x724c952C0492dEC405201937006bB48f366E6C22',
  EVERMARK_REWARDS: '0x3205fe573AEdCD3026d085D9056Db8ae0488B390',
  EVERMARK_AUCTION: '0x8a927E063d32e46cDeDe59DeC7BbF3be06316449'
};

// Function to get environment variables that works in both browser and Node.js
function getEnvVar(key: string): string {
  // Check if we're in a Node.js environment (Netlify functions)
  if (typeof process !== 'undefined' && process.env) {
    // Try both VITE_ prefixed and non-prefixed versions
    return process.env[key] || process.env[`VITE_${key}`] || '';
  }
  
  // In browser environment, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[`VITE_${key}`] || '';
  }
  
  return '';
}

// IPFS Configuration - uses environment variables for secrets only
export const IPFS_CONFIG = {
  PINATA_API_KEY: getEnvVar('PINATA_API_KEY'),
  PINATA_SECRET_KEY: getEnvVar('PINATA_SECRET_KEY'),
  GATEWAY_URL: 'https://gateway.pinata.cloud', // Public gateway URL
};

// API Configuration - uses environment variables for secrets only
export const API_CONFIG = {
  RPC_URL: 'https://mainnet.base.org', // Public RPC URL
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
};

// Legacy constant for compatibility
export const CONTRACT_CONSTANTS = {
  EVERMARK_CONTRACT_ADDRESS: CONTRACT_ADDRESSES.BOOKMARK_NFT
};

// Add this check to ensure required env vars are present
if (!API_CONFIG.SUPABASE_URL || !API_CONFIG.SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables - database features may not work');
}

if (!IPFS_CONFIG.PINATA_API_KEY || !IPFS_CONFIG.PINATA_SECRET_KEY) {
  console.warn('Missing Pinata environment variables - IPFS features may not work');
}