// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { AuthState, User, Session } from '../types/user.types';
import { authService, userService } from '../services/auth.service';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Auto-authenticate when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      autoAuthenticate(address);
    } else if (!isConnected && authState.session) {
      // Clear session when disconnected
      authService.clearSession();
      setAuthState(prev => ({ 
        ...prev, 
        isConnected: false,
        session: null,
        user: null
      }));
    } else {
      setAuthState(prev => ({
        ...prev,
        isConnected
      }));
    }
  }, [isConnected, address]);

  // Auto-authenticate with wallet address
  const autoAuthenticate = useCallback(async (walletAddress: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Create session without signature
      const session = await authService.createBlockchainSessionNoSignature(walletAddress);
      
      // Get or create user profile
      const user = await userService.getUserProfile() || {
        id: session.userId,
        walletAddress: walletAddress,
        username: `User ${walletAddress.slice(0, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evermarksCount: 0,
        votingPower: 0,
        totalVotes: 0,
      };
      
      setAuthState({
        user,
        session,
        isConnected: true,
        isLoading: false,
        error: null,
      });
      
    } catch (error: any) {
      console.error('Auto authentication failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Authentication failed' 
      }));
    }
  }, []);

  // Helper to check if user is authenticated
  const isAuthenticated = authState.user !== null && authState.session !== null;

  // Sign out function that uses the wagmi disconnect
  const signOut = useCallback(() => {
    authService.clearSession();
    disconnect();
    
    setAuthState({
      user: null,
      session: null,
      isConnected: false,
      isLoading: false,
      error: null,
    });
  }, [disconnect]);

  return {
    ...authState,
    isAuthenticated,
    signOut
  };
}