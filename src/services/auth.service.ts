import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { AUTH_CONSTANTS } from '../config/constants';
import { BrowserProvider } from 'ethers';

class AuthService {
  /**
   * Generate a random nonce for wallet signature verification
   */
  generateNonce(): string {
    return `${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
  }

  /**
   * Generate a unique session token
   */
  generateSessionToken(): string {
    return uuidv4();
  }

  /**
   * Store session in localStorage
   */
  storeSession(token: string): void {
    localStorage.setItem(AUTH_CONSTANTS.SESSION_TOKEN_KEY, token);
  }

  /**
   * Get session token from localStorage
   */
  getSessionToken(): string | null {
    return localStorage.getItem(AUTH_CONSTANTS.SESSION_TOKEN_KEY);
  }

  /**
   * Clear session from localStorage
   */
  clearSession(): void {
    localStorage.removeItem(AUTH_CONSTANTS.SESSION_TOKEN_KEY);
  }

  /**
   * Create a new session for a user
   */
  async createSession(userId: string, walletAddress: string): Promise<string> {
    const sessionToken = this.generateSessionToken();
    
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
  }

  /**
   * Validate a session token
   */
  async validateSession(token: string): Promise<{ valid: boolean; userId?: string; walletAddress?: string }> {
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
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionToken: string): Promise<void> {
    await supabase
      .from('sessions')
      .delete()
      .eq('token', sessionToken);
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Request accounts
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      return accounts[0];
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Sign message with connected wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.signMessage(message);
    } catch (error: any) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Get current wallet address
   */
  async getAddress(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      return accounts[0]?.address || null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }
}

export const authService = new AuthService();

// User Service for profile management
class UserService {
  async getUserProfile(): Promise<any> {
    try {
      // Get current session
      const token = authService.getSessionToken();
      if (!token) return null;

      // Validate session to get userId
      const { valid, userId } = await authService.validateSession(token);
      if (!valid || !userId) return null;

      // Fetch user profile
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  async createOrUpdateUser(walletAddress: string, fid?: number, username?: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          wallet_address: walletAddress.toLowerCase(),
          fid: fid || null,
          username: username || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create/update user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();