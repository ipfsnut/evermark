// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { AuthState, User, Session } from '../types/user.types';
import { authService, userService } from '../services/auth.service';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();
  
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
  }, [isConnected]);

  // Load existing session
  const loadSession = useCallback(async () => {
    const token = authService.getSessionToken();
    if (!token) return;

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { valid, userId, walletAddress } = await authService.validateSession(token);
      
      if (valid && userId) {
        const user = await userService.getUserProfile();
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user,
            session: { token, userId, walletAddress: walletAddress!, expiresAt: '' },
            isLoading: false,
          }));
        }
      } else {
        // Invalid session, clear it
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
    if (!address || !signMessage) {
      setAuthState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return false;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate nonce
      const nonce = authService.generateNonce();
      const message = `Sign this message to authenticate with Evermark.\n\nAddress: ${address}\nNonce: ${nonce}`;
      
      // Sign message
      const signature = await signMessage({ message });
      
      // Authenticate with backend
      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
        }),
      });

      if (!response.ok) throw new Error('Authentication failed');
      
      const { token, userId } = await response.json();
      
      // Store session
      authService.storeSession(token);
      
      // Get user profile
      const user = await userService.getUserProfile();
      if (!user) {
        throw new Error('Failed to fetch user profile');
      }
      
      setAuthState(prev => ({
        ...prev,
        user,
        session: { token, userId, walletAddress: address, expiresAt: '' },
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
  }, [address, signMessage]);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (authState.session?.token) {
        await authService.deleteSession(authState.session.token);
      }
      
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
  }, [authState.session?.token, disconnect]);

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