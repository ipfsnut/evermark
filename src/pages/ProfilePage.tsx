import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBlockchain } from '../hooks/useBlockchain';
import { formatEther } from '../services/blockchain';
import { 
  UserIcon, 
  WalletIcon, 
  CoinsIcon, 
  StarsIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CopyIcon
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { 
    balances, 
    stakeInfo, 
    stakeTokens, 
    withdrawTokens, 
    completeUnwrap, 
    transaction,
    clearTransaction 
  } = useBlockchain();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const handleStake = async () => {
    if (!stakeAmount) return;
    await stakeTokens(stakeAmount);
    setStakeAmount('');
    setShowStakeForm(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    await withdrawTokens(withdrawAmount);
    setWithdrawAmount('');
    setShowWithdrawForm(false);
  };

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username || 'Anonymous User'}
              </h1>
              <div className="flex items-center text-sm text-gray-600">
                <WalletIcon className="w-4 h-4 mr-1" />
                <span className="font-mono">{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</span>
                <button onClick={copyAddress} className="ml-2 p-1 hover:bg-gray-100 rounded">
                  <CopyIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tokens & Staking */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tokens & Voting Power</h2>
        
        {/* Balances Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <CoinsIcon className="w-4 h-4 mr-1" />
              Available
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatEther(balances.available)}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-blue-600 mb-1">
              <StarsIcon className="w-4 h-4 mr-1" />
              Staked
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatEther(balances.staked)}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-purple-600 mb-1">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              Voting Power
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {formatEther(balances.votingPower)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <ArrowDownIcon className="w-4 h-4 mr-1" />
              Unbonding
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatEther(balances.locked)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowStakeForm(!showStakeForm)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowUpIcon className="inline w-4 h-4 mr-1" />
            Stake Tokens
          </button>
          <button
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowDownIcon className="inline w-4 h-4 mr-1" />
            Withdraw
          </button>
        </div>

        {/* Stake Form */}
        {showStakeForm && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex gap-4">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount to stake"
                className="flex-1 px-3 py-2 border rounded-md"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleStake}
                disabled={!stakeAmount || transaction.status === 'pending'}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {transaction.status === 'pending' ? 'Staking...' : 'Stake'}
              </button>
            </div>
          </div>
        )}

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount to withdraw"
                className="flex-1 px-3 py-2 border rounded-md"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || transaction.status === 'pending'}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {transaction.status === 'pending' ? 'Requesting...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {transaction.hash && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              Transaction submitted: {transaction.hash.slice(0, 12)}...
            </p>
            {transaction.status === 'success' && (
              <p className="text-sm text-green-600 mt-1">Transaction confirmed!</p>
            )}
            {transaction.error && (
              <p className="text-sm text-red-600 mt-1">Error: {transaction.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Unbonding Requests */}
      {stakeInfo.unbondingRequests && stakeInfo.unbondingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Unbonding Requests</h2>
          <div className="space-y-3">
            {stakeInfo.unbondingRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{formatEther(request.amount)} NSI</div>
                  <div className="text-sm text-gray-600">
                    Available: {new Date(request.releaseTime * 1000).toLocaleString()}
                  </div>
                </div>
                {request.releaseTime <= Date.now() / 1000 && (
                  <button
                    onClick={() => completeUnwrap(index)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;