// src/components/common/NetworkStatus.tsx
import React, { useState, useEffect } from 'react';
import { contractService } from '../../services/blockchain';
import { WifiIcon, WifiOffIcon, LoaderIcon } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'error'>(
    contractService.getNetworkStatus()
  );
  
  useEffect(() => {
    // Poll for status updates
    const interval = setInterval(() => {
      setStatus(contractService.getNetworkStatus());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const statusClass = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500 animate-pulse',
    error: 'bg-red-500'
  }[status];
  
  const statusIcon = {
    connected: <WifiIcon className="h-3 w-3 text-white" />,
    connecting: <LoaderIcon className="h-3 w-3 text-white animate-spin" />,
    error: <WifiOffIcon className="h-3 w-3 text-white" />
  }[status];
  
  const statusText = {
    connected: 'Connected',
    connecting: 'Connecting',
    error: 'Network Error'
  }[status];
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center ${statusClass} rounded-full shadow-md px-2 py-1`}>
        <span className="mr-1">{statusIcon}</span>
        <span className="text-xs text-white font-mono">{statusText}</span>
      </div>
    </div>
  );
};