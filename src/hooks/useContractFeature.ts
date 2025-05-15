// src/hooks/useContractFeature.ts template
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '../services/blockchain';
import { errorLogger } from '../utils/error-logger';

export function useContractFeature() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Read method example
  const fetchData = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractService.contractMethod(address);
      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      errorLogger.log('useContractFeature', err, { method: 'fetchData', address });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Write method example
  const performAction = useCallback(async (param: string) => {
    if (!address) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contractService.contractWriteMethod(param);
      await tx.wait();
      
      // Refresh data after successful transaction
      await fetchData();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      errorLogger.log('useContractFeature', err, { method: 'performAction', param, address });
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [address, fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    performAction,
  };
}