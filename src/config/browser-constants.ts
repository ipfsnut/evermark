// Browser-specific configuration that uses Vite's import.meta
export const BROWSER_CONFIG = {
    IPFS: {
      PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY || '',
      PINATA_SECRET_KEY: import.meta.env.VITE_PINATA_SECRET_KEY || '',
      GATEWAY_URL: 'https://gateway.pinata.cloud',
    },
    API: {
      RPC_URL: 'https://mainnet.base.org',
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
  };
  
  // Warning checks
  if (!BROWSER_CONFIG.API.SUPABASE_URL || !BROWSER_CONFIG.API.SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables - database features may not work');
  }
  
  if (!BROWSER_CONFIG.IPFS.PINATA_API_KEY || !BROWSER_CONFIG.IPFS.PINATA_SECRET_KEY) {
    console.warn('Missing Pinata environment variables - IPFS features may not work');
  }