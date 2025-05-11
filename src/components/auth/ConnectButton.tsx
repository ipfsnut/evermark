import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '../../hooks/useAuth';

export const ConnectButton: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth();

  // If connected but not authenticated, show sign in
  if (isConnected && !isAuthenticated) {
    return (
      <button
        onClick={signIn}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Signing...' : 'Sign In'}
      </button>
    );
  }

  // If authenticated, show user info and sign out
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <div className="font-medium">{user.username || 'User'}</div>
          <div className="text-xs">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </div>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // If not connected, show connection options
  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
};