// src/components/voting/CycleInfoBar.tsx
import React, { useEffect } from 'react';
import { useVoting } from '../../hooks/useVoting';
import { ClockIcon, CalendarIcon } from 'lucide-react';

export const CycleInfoBar: React.FC = () => {
  const { cycle, timeRemaining, fetchCycleInfo } = useVoting();
  
  useEffect(() => {
    fetchCycleInfo();
    
    // Update every minute
    const interval = setInterval(() => {
      fetchCycleInfo();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchCycleInfo]);
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Cycle ending soon';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m ${seconds % 60}s remaining`;
    }
  };
  
  return (
    <div className="bg-warpcast/10 text-sm rounded-lg p-3 flex items-center justify-between mb-4">
      <div className="flex items-center">
        <CalendarIcon className="h-4 w-4 mr-2 text-warpcast" />
        <span className="font-serif">Voting Cycle #{cycle}</span>
      </div>
      <div className="flex items-center">
        <ClockIcon className="h-4 w-4 mr-2 text-warpcast" />
        <span className="font-serif">{formatTimeRemaining(timeRemaining)}</span>
      </div>
    </div>
  );
};