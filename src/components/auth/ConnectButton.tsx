import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';
import { WalletIcon, LogOutIcon, LoaderIcon } from 'lucide-react';

export const ConnectButton: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, isAuthenticated, signOut, isLoading } = useAuth();

  // Handler for connect button
  const handleConnect = (connector: any) => (e: React.MouseEvent) => {
    connect({ connector });
  };

  // If authenticated, show user info and sign out
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2 group">
        <div className="text-sm text-parchment-light hidden sm:block">
          <div className="font-medium">{user.username || 'User'}</div>
          <div className="text-xs font-mono opacity-70">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-3 py-1.5 bg-ink-light hover:bg-ink-dark text-parchment-light text-sm rounded-md border border-warpcast/40 transition-all hover:shadow-[0_0_8px_rgba(130,82,228,0.3)] hover:border-warpcast group-hover:border-warpcast/60"
        >
          <LogOutIcon className="w-4 h-4 text-warpcast" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  // If connecting or authenticating, show loading state
  if (isPending || isLoading) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-warpcast/20 text-parchment-light/70 rounded-md cursor-not-allowed"
      >
        <LoaderIcon className="w-4 h-4 animate-spin text-warpcast-light" />
        <span className="hidden sm:inline">Connecting...</span>
      </button>
    );
  }

  // If not connected, show connection options with improved UI
  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={handleConnect(connector)}
          className="flex items-center gap-2 px-3 py-1.5 bg-warpcast text-white rounded-md hover:bg-warpcast-dark transition-all duration-200 shadow-md hover:shadow-[0_0_12px_rgba(130,82,228,0.5)] relative overflow-hidden group"
        >
          {/* Animated gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-warpcast via-warpcast-dark to-warpcast opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <WalletIcon className="w-4 h-4 relative z-10" />
          <span className="hidden sm:inline relative z-10">Connect {connector.name}</span>
        </button>
      ))}
    </div>
  );
};