// src/config/constants.ts for Evermark

// Base URL for API endpoints  
const API_BASE = '/.netlify/functions';

export const AUTH_CONSTANTS = {
  SESSION_TOKEN_KEY: 'evermark_session_token', // Changed from bookmarks_session_token
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
  EVERMARKS: `${API_BASE}/evermarks`, // Changed from bookmarks
  BISAC_CODES: '/.netlify/functions/bisac-codes'
};

// Contract addresses for the Evermark protocol (need to be updated with new deployment addresses)
export const CONTRACT_ADDRESSES = {
  NSI_TOKEN: '0x1696688A7828E227E64953C371aC0B57d5974B55', // May need to be updated
  CARD_CATALOG: process.env.VITE_CARD_CATALOG_ADDRESS || '',
  EVERMARK_NFT: process.env.VITE_EVERMARK_NFT_ADDRESS || '', // Changed from BOOKMARK_NFT
  EVERMARK_VOTING: process.env.VITE_EVERMARK_VOTING_ADDRESS || '', // Changed from BOOKMARK_VOTING
  EVERMARK_LEADERBOARD: process.env.VITE_EVERMARK_LEADERBOARD_ADDRESS || '', // Changed from BOOKMARK_LEADERBOARD
  EVERMARK_REWARDS: process.env.VITE_EVERMARK_REWARDS_ADDRESS || '', // Changed from BOOKMARK_REWARDS
  EVERMARK_AUCTION: process.env.VITE_EVERMARK_AUCTION_ADDRESS || '' // Changed from BOOKMARK_AUCTION
};

// IPFS Configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.VITE_PINATA_API_KEY!,
  PINATA_SECRET_KEY: process.env.VITE_PINATA_SECRET_KEY!,
  GATEWAY_URL: process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
};

// API Configuration
export const API_CONFIG = {
  RPC_URL: process.env.VITE_RPC_URL || 'https://mainnet.base.org',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
};

// Legacy constant for compatibility (can be removed after full migration)
export const CONTRACT_CONSTANTS = {
  EVERMARK_CONTRACT_ADDRESS: import.meta.env.VITE_EVERMARK_CONTRACT_ADDRESS || '0x6A9e955499c37f7e725060bfDB00257010E95b41'
};