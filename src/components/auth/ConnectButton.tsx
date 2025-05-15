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
          className="btn-secondary btn-icon"
          aria-label="Sign out"
        >
          <LogOutIcon className="w-4 h-4 text-warpcast" />
          <span className="hidden sm:inline ml-2">Sign Out</span>
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
        aria-busy="true"
      >
        <LoaderIcon className="w-4 h-4 animate-spin text-warpcast-light" />
        <span className="hidden sm:inline">Connecting...</span>
      </button>
    );
  }

  // If not connected, show connection options 
  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={handleConnect(connector)}
          className="btn-primary"
          aria-label={`Connect with ${connector.name}`}
        >
          <WalletIcon className="w-4 h-4 relative z-10" />
          <span className="hidden sm:inline relative z-10 ml-2">
            Connect {connector.name}
          </span>
        </button>
      ))}
    </div>
  );
};