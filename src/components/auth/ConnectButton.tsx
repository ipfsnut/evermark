import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';

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
      <div className="flex items-center gap-4">
        <div className="text-sm text-parchment-light">
          <div className="font-serif">{user.username || 'User'}</div>
          <div className="text-xs font-mono">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-1.5 bg-parchment text-ink-dark text-sm rounded-md border border-wood-light hover:bg-parchment-dark"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // If connecting or authenticating, show loading state
  if (isPending || isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-parchment-dark text-ink-light rounded-md opacity-50 cursor-not-allowed"
      >
        Connecting...
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
          className="px-4 py-2 bg-brass text-ink-dark rounded-md hover:bg-brass-dark shadow-sm transition-colors"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
};