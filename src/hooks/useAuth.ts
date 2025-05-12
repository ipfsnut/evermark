// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { AuthState, User, Session } from '../types/user.types';
import { authService, userService } from '../services/auth.service';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage(); // Changed from signMessage to signMessageAsync
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Update connection status
  useEffect(() => {
    setAuthState(prev => ({ ...prev, isConnected }));
    
    // If disconnected, clear the session
    if (!isConnected && authState.session) {
      authService.clearSession();
      setAuthState(prev => ({ 
        ...prev, 
        session: null,
        user: null
      }));
    }
  }, [isConnected, authState.session]);

  // Load existing session
  const loadSession = useCallback(async () => {
    console.log("Loading session...");
    const session = authService.getSession();
    if (!session) {
      console.log("No session found");
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { valid, walletAddress } = await authService.validateSession(session.token);
      
      if (valid && walletAddress) {
        console.log("Session valid, getting user profile");
        const user = await userService.getUserProfile();
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user,
            session,
            isLoading: false,
          }));
        }
      } else {
        // Invalid session, clear it
        console.log("Session invalid, clearing");
        authService.clearSession();
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      authService.clearSession();
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Failed to load session' }));
    }
  }, []);

  // Sign in with wallet
  const signIn = useCallback(async () => {
    if (!address || !signMessageAsync) {
      setAuthState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return false;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate nonce
      const nonce = authService.generateNonce();
      const message = `Sign this message to authenticate with Evermark.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
      
      // Sign message - using signMessageAsync to get a Promise<string>
      const signature = await signMessageAsync({ message });
      
      // Verify signature
      const isValid = await authService.verifySignature(message, signature, address);
      if (!isValid) {
        throw new Error('Signature verification failed');
      }
      
      // Create blockchain session
      const session = await authService.createBlockchainSession(address);
      
      // Get or create user profile
      const user = await userService.getUserProfile() || {
        id: session.userId,
        walletAddress: address,
        username: `User ${address.slice(0, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evermarksCount: 0,
        votingPower: 0,
        totalVotes: 0,
      };
      
      setAuthState(prev => ({
        ...prev,
        user,
        session,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Authentication failed' 
      }));
      return false;
    }
  }, [address, signMessageAsync]);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      authService.clearSession();
      disconnect();
      
      setAuthState({
        user: null,
        session: null,
        isConnected: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [disconnect]);

  // Helper to check if user is authenticated
  const isAuthenticated = authState.user !== null && authState.session !== null;

  return {
    ...authState,
    isAuthenticated,
    signIn,
    signOut,
    loadSession,
  };
}