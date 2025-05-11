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

// IPFS Configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.VITE_PINATA_API_KEY || import.meta.env.VITE_PINATA_API_KEY || '',
  PINATA_SECRET_KEY: process.env.VITE_PINATA_SECRET_KEY || import.meta.env.VITE_PINATA_SECRET_KEY || '',
  GATEWAY_URL: process.env.VITE_PINATA_GATEWAY || import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
};

// API Configuration
export const API_CONFIG = {
  RPC_URL: process.env.VITE_RPC_URL || import.meta.env.VITE_RPC_URL || 'https://mainnet.base.org',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Legacy constant for compatibility
export const CONTRACT_CONSTANTS = {
  EVERMARK_CONTRACT_ADDRESS: import.meta.env.VITE_EVERMARK_CONTRACT_ADDRESS || CONTRACT_ADDRESSES.BOOKMARK_NFT
};