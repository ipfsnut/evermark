// src/components/voting/VotePowerAllocation.tsx
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../hooks/useBlockchain';
import { formatEther } from '../../services/blockchain';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SlidersIcon, InfoIcon } from 'lucide-react';

// This would come from contract queries
interface VotingAllocation {
  evermarkId: string;
  title: string;
  votes: bigint;
}

export const VotePowerAllocation: React.FC = () => {
  const { balances } = useBlockchain();
  const [allocations, setAllocations] = useState<VotingAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Calculate available voting power
  const totalPower = Number(formatEther(balances.votingPower));
  const allocatedPower = allocations.reduce((sum, item) => sum + Number(formatEther(item.votes)), 0);
  const availablePower = totalPower - allocatedPower;
  
  // Mock data fetch - replace with actual contract call
  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - replace with actual API/contract call
        const mockAllocations: VotingAllocation[] = [
          {
            evermarkId: '1',
            title: 'The Importance of Blockchain',
            votes: BigInt(2 * 10**18)
          },
          {
            evermarkId: '4',
            title: 'Web3 Development Guide',
            votes: BigInt(1.5 * 10**18)
          },
          {
            evermarkId: '7',
            title: 'DeFi Explained',
            votes: BigInt(0.8 * 10**18)
          }
        ];
        
        setAllocations(mockAllocations);
      } catch (error) {
        console.error('Failed to fetch vote allocations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllocations();
  }, []);

  // Prepare chart data
  const chartData = [
    ...allocations.map(item => ({
      name: item.title.length > 20 ? item.title.slice(0, 20) + '...' : item.title,
      value: Number(formatEther(item.votes))
    })),
    { name: 'Available', value: availablePower }
  ];
  
  // Colors for chart
  const COLORS = ['#8252e4', '#9d7dea', '#b9a2f1', '#d4caf8', '#eeeafc', '#d1d1d1'];

  return (
    <div className="bg-parchment-texture rounded-lg shadow-md p-6 border border-wood-light/30 mt-6">
      <h2 className="text-responsive-subtitle text-ink-dark font-serif mb-4 flex items-center">
        <SlidersIcon className="h-5 w-5 mr-2 text-warpcast" />
        Your Voting Power Allocation
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warpcast"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} votes`, 'Amount']} 
                    labelFormatter={(name) => `${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-wood-light/30 pb-2">
              <span className="font-serif font-medium text-ink-dark">Evermark</span>
              <span className="font-serif font-medium text-ink-dark">Votes</span>
            </div>
            
            {allocations.map((allocation, index) => (
              <div key={allocation.evermarkId} className="flex justify-between items-center py-2 animate-text-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-serif text-ink-dark truncate max-w-xs">
                    {allocation.title}
                  </span>
                </div>
                <span className="font-serif text-ink-dark">
                  {formatEther(allocation.votes)}
                </span>
              </div>
            ))}
            
            <div className="flex justify-between items-center py-2 border-t border-wood-light/30 animate-text-in" style={{animationDelay: `${allocations.length * 0.1}s`}}>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[allocations.length % COLORS.length] }}></span>
                <span className="font-serif font-medium text-ink-dark">
                  Available
                </span>
              </div>
              <span className="font-serif font-medium text-ink-dark">
                {availablePower}
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-warpcast/5 rounded-md flex items-start">
            <InfoIcon className="h-4 w-4 text-warpcast mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-serif text-ink-light">
              Your voting power is determined by your staked tokens. Allocate your votes to support evermarks you value, which affects their ranking in the weekly leaderboard.
            </p>
          </div>
        </>
      )}
    </div>
  );
};