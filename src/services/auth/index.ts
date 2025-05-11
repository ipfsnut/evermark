import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../config/supabase';
import { AUTH_CONSTANTS } from '../../config/constants';

/**
 * Generates a random nonce for wallet signature verification
 */
export const generateNonce = (): string => {
  return `${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
};

/**
 * Generates a unique session token
 */
export const generateSessionToken = (): string => {
  return uuidv4();
};

/**
 * Creates a new session for a user
 */
export const createSession = async (userId: string, walletAddress: string): Promise<string> => {
  const sessionToken = generateSessionToken();
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + AUTH_CONSTANTS.SESSION_DURATION_DAYS);
  
  console.log('Creating session with token:', sessionToken);
  
  // Store session in database
  const { error } = await supabase
    .from('sessions')
    .insert([{
      user_id: userId,
      wallet_address: walletAddress.toLowerCase(),
      token: sessionToken,
      expires_at: expiresAt.toISOString(),
    }]);
  
  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  
  return sessionToken;
};

/**
 * Validates a session token
 */
export const validateSession = async (token: string): Promise<{ valid: boolean; userId?: string; walletAddress?: string }> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('user_id, wallet_address, expires_at')
      .eq('token', token)
      .single();
    
    if (error) {
      console.error('Session validation failed:', error);
      return { valid: false };
    }
    
    if (!data) {
      return { valid: false };
    }
    
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      return { valid: false };
    }
    
    return { 
      valid: true, 
      userId: data.user_id,
      walletAddress: data.wallet_address
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return { valid: false };
  }
};

/**
 * Deletes a session
 */
export const deleteSession = async (sessionToken: string): Promise<void> => {
  await supabase
    .from('sessions')
    .delete()
    .eq('token', sessionToken);
};

// src/services/auth/wallet.ts
import { BrowserProvider } from 'ethers';

class WalletService {
  private provider: BrowserProvider | null = null;
  
  // Connect wallet
  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    
    try {
      this.provider = new BrowserProvider(window.ethereum);
      
      // Request accounts
      const accounts = await this.provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      return accounts[0];
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }
  
  // Sign message with ethers v6
  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signer = await this.provider.getSigner();
      return await signer.signMessage(message);
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }
  
  // Get current address
  async getAddress(): Promise<string | null> {
    if (!this.provider) {
      return null;
    }
    
    try {
      const accounts = await this.provider.listAccounts();
      return accounts[0]?.address || null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }
}

export const walletService = new WalletService();