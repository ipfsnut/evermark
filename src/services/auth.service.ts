// src/services/auth.service.ts
import { v4 as uuidv4 } from 'uuid';
import { AUTH_CONSTANTS } from '../config/constants';
import { BrowserProvider } from 'ethers';
import { User, Session } from '../types/user.types';

// Blockchain-only AuthService Implementation
export class AuthService {
  /**
   * Generate a random nonce for wallet signature verification
   */
  generateNonce(): string {
    return `${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
  }

  /**
   * Store session in localStorage
   */
  storeSession(session: Session): void {
    localStorage.setItem(AUTH_CONSTANTS.SESSION_TOKEN_KEY, JSON.stringify(session));
  }

  /**
   * Get session from localStorage
   */
  getSession(): Session | null {
    const sessionData = localStorage.getItem(AUTH_CONSTANTS.SESSION_TOKEN_KEY);
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch (e) {
      console.error('Failed to parse session data:', e);
      return null;
    }
  }

  /**
   * Get session token
   */
  getSessionToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  /**
   * Clear session from localStorage
   */
  clearSession(): void {
    localStorage.removeItem(AUTH_CONSTANTS.SESSION_TOKEN_KEY);
  }

  /**
   * Validate a session
   * In blockchain-only mode, we simply check if it exists and hasn't expired
   */
  async validateSession(token: string): Promise<{ valid: boolean; userId?: string; walletAddress?: string }> {
    const session = this.getSession();
    
    if (!session || session.token !== token) {
      return { valid: false };
    }
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now > expiresAt) {
      return { valid: false };
    }
    
    return { 
      valid: true, 
      userId: session.userId,
      walletAddress: session.walletAddress
    };
  }

  /**
   * Create a new blockchain session without requiring a signature
   * This uses just the wallet address as authentication
   */
  async createBlockchainSessionNoSignature(walletAddress: string): Promise<Session> {
    // Generate a unique ID for the user (shortened wallet + random)
    const userId = `${walletAddress.slice(2, 10)}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Generate a session token
    const token = uuidv4();
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_CONSTANTS.SESSION_DURATION_DAYS);
    
    // Create session
    const session: Session = {
      userId,
      token,
      walletAddress,
      expiresAt: expiresAt.toISOString()
    };
    
    // Store in localStorage
    this.storeSession(session);
    
    return session;
  }

  /**
   * Create a new blockchain-only session
   * Since there's no DB, we just use localStorage and the wallet address as ID
   */
  async createBlockchainSession(walletAddress: string): Promise<Session> {
    // Generate a unique ID for the user (shortened wallet + random)
    const userId = `${walletAddress.slice(2, 10)}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Generate a session token
    const token = uuidv4();
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_CONSTANTS.SESSION_DURATION_DAYS);
    
    // Create session
    const session: Session = {
      userId,
      token,
      walletAddress,
      expiresAt: expiresAt.toISOString()
    };
    
    // Store in localStorage
    this.storeSession(session);
    
    return session;
  }
  
  /**
   * Delete a session
   * In blockchain-only mode, this just clears localStorage
   */
  async deleteSession(token: string): Promise<void> {
    this.clearSession();
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
   * Sign message directly with ethers.js
   * This is a fallback for when wagmi's method doesn't work
   */
  async signMessageDirectly(message: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.signMessage(message);
    } catch (error: any) {
      throw new Error(`Failed to sign message directly: ${error.message}`);
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
  
  /**
   * Verify message signature
   */
  async verifySignature(message: string, signature: string, expectedAddress: string): Promise<boolean> {
    try {
      const { ethers } = await import('ethers');
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }
}

// Blockchain-only UserService Implementation
export class UserService {
  private authService: AuthService;
  
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getUserProfile(): Promise<User | null> {
    try {
      // Get current session
      const session = this.authService.getSession();
      if (!session) return null;

      // Get wallet address
      const walletAddress = session.walletAddress;
      if (!walletAddress) return null;
      
      // In a blockchain-only app, the user profile comes from:
      // 1. Local storage (basic info)
      // 2. Blockchain queries (evermarks, votes, etc.)
      
      // Get additional profile data from localStorage if it exists
      const profileData = localStorage.getItem(`user_profile_${walletAddress}`);
      const storedProfile = profileData ? JSON.parse(profileData) : {};
      
      // Create a basic user profile
      const user: User = {
        id: session.userId,
        walletAddress,
        username: storedProfile.username || walletAddress.slice(0, 6),
        createdAt: storedProfile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Add these once we pull blockchain data
        evermarksCount: 0,
        votingPower: 0,
        totalVotes: 0,
      };
      
      // TODO: Enhance with blockchain data in a later step
      // - Query user's evermarks count from contract
      // - Get voting power from contract
      // - Get total votes from contract
      
      return user;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<User | null> {
    try {
      // Get current session
      const session = this.authService.getSession();
      if (!session) throw new Error('Not authenticated');

      const walletAddress = session.walletAddress;
      if (!walletAddress) throw new Error('No wallet address');
      
      // Get current profile
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) throw new Error('Profile not found');
      
      // Update profile
      const updatedProfile: User = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // Store in localStorage
      localStorage.setItem(`user_profile_${walletAddress}`, JSON.stringify(updatedProfile));
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return null;
    }
  }
}

// Create singleton instances
export const authService = new AuthService();
export const userService = new UserService(authService);