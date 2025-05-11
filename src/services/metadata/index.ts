export { metadataService } from './MetadataService';

// src/config/constants.ts (adapted for Evermark)
export const AUTH_CONSTANTS = {
  SESSION_TOKEN_KEY: 'evermark_session_token',
  SESSION_DURATION_DAYS: 7,
};

export const CONTRACT_ADDRESSES = {
  EVERMARK_NFT: process.env.VITE_EVERMARK_NFT_ADDRESS!,
  CARD_CATALOG: process.env.VITE_CARD_CATALOG_ADDRESS!,
  EVERMARK_VOTING: process.env.VITE_EVERMARK_VOTING_ADDRESS!,
};

export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.VITE_PINATA_API_KEY!,
  PINATA_SECRET_KEY: process.env.VITE_PINATA_SECRET_KEY!,
  GATEWAY_URL: process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
};

export const API_CONFIG = {
  RPC_URL: process.env.VITE_RPC_URL || 'https://mainnet.base.org',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
};

