// src/services/blockchain/BaseContractService.ts

import { Contract, ContractRunner, JsonRpcProvider, ethers } from 'ethers';
import { errorLogger } from '../../utils/error-logger';

/**
 * Sleep for the specified duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate backoff time for retries with exponential backoff
 */
const calculateBackoff = (attempt: number, baseMs: number = 1000, maxMs: number = 30000) => {
  const backoff = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  // Add jitter to prevent retry storms
  return backoff + Math.random() * (backoff * 0.2);
};

/**
 * Batch process an array of items with specified batch size and delay
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processFn: (item: T) => Promise<R>,
  delayMs: number = 500
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(processFn);
    
    // Process current batch
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Extract successful results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results[i + index] = result.value;
      } else {
        console.warn(`Failed to process item ${i + index}:`, result.reason);
        results[i + index] = null as unknown as R;
      }
    });
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }
  
  return results;
}

/**
 * Base contract service with caching, retry logic, and provider management
 */
export class BaseContractService {
  protected provider: JsonRpcProvider;
  protected contracts: Map<string, Contract> = new Map();
  protected cache: Map<string, { value: any; timestamp: number }> = new Map();
  
  // Fallback RPC URLs - can be extended in child classes
  protected rpcUrls = [
    'https://mainnet.base.org',
    'https://base-mainnet.public.blastapi.io',
    'https://base.llamarpc.com'
  ];
  
  protected currentRpcIndex = 0;
  protected lastProviderSwitch = 0;
  protected networkStatus: 'connected' | 'connecting' | 'error' = 'connecting';
  protected switchingProvider = false;
  
  constructor(initialRpcUrl?: string) {
    if (initialRpcUrl) {
      this.rpcUrls.unshift(initialRpcUrl); // Add user-provided URL as first option
    }
    this.provider = new JsonRpcProvider(this.rpcUrls[0]);
    this.checkConnection();
  }
  
  /**
   * Check if the current provider is connected
   */
  private async checkConnection() {
    try {
      await this.provider.getBlockNumber();
      this.networkStatus = 'connected';
    } catch (error) {
      this.networkStatus = 'error';
      // Try switching provider
      this.switchRpcProvider();
    }
  }
  
  /**
   * Get current network status
   */
  public getNetworkStatus() {
    return this.networkStatus;
  }
  
  /**
   * Switch to a different RPC provider
   */
  protected async switchRpcProvider(): Promise<boolean> {
    // Prevent concurrent switches
    if (this.switchingProvider) {
      return false;
    }
    
    // Don't switch providers too frequently
    const now = Date.now();
    if (now - this.lastProviderSwitch < 10000) {
      return false;
    }
    
    this.switchingProvider = true;
    this.lastProviderSwitch = now;
    this.networkStatus = 'connecting';
    
    try {
      // Try the next provider
      this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
      this.provider = new JsonRpcProvider(this.rpcUrls[this.currentRpcIndex]);
      
      // Clear contract cache when switching providers
      this.contracts.clear();
      
      console.log(`Switching to RPC provider: ${this.rpcUrls[this.currentRpcIndex]}`);
      
      // Test the new connection
      await this.provider.getBlockNumber();
      this.networkStatus = 'connected';
      return true;
    } catch (error) {
      console.warn(`Provider ${this.rpcUrls[this.currentRpcIndex]} failed`);
      this.networkStatus = 'error';
      return false;
    } finally {
      this.switchingProvider = false;
    }
  }
  
  /**
   * Get contract instance with caching
   */
  public getContract(address: string, abi: any[], runner?: ContractRunner): Contract {
    try {
      // Ensure address is properly formatted
      const formattedAddress = ethers.getAddress(address);
      const key = `${formattedAddress.toLowerCase()}_${runner ? 'signer' : 'provider'}`;
      
      if (!this.contracts.has(key)) {
        const contract = new Contract(formattedAddress, abi, runner || this.provider);
        this.contracts.set(key, contract);
      }
      
      return this.contracts.get(key)!;
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getContract', address });
      throw new Error(`Failed to get contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Call contract method with caching, retries, and exponential backoff
   */
  async callContract<T>(
    contract: Contract,
    method: string,
    args: any[] = [],
    options: { 
      cache?: boolean; 
      cacheTime?: number; 
      retry?: boolean;
      maxRetries?: number;
      retryBaseDelay?: number; 
    } = {}
  ): Promise<T> {
    const { 
      cache = true, 
      cacheTime = 30000, 
      retry = true,
      maxRetries = 5,  // Maximum retry attempts
      retryBaseDelay = 1000  // Base delay in ms (will be doubled each retry)
    } = options;
    
    const cacheKey = `${contract.target}_${method}_${JSON.stringify(args)}`;
    
    // Check cache
    if (cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        return cached.value;
      }
    }
    
    let lastError: Error | null = null;
    
    // Try to call the contract with retries and exponential backoff
    for (let attempt = 0; attempt < (retry ? maxRetries : 1); attempt++) {
      try {
        // If not the first attempt, wait with exponential backoff
        if (attempt > 0) {
          const backoffTime = calculateBackoff(attempt, retryBaseDelay);
          console.log(`Retry attempt ${attempt} for ${method}, waiting ${Math.round(backoffTime)}ms`);
          await sleep(backoffTime);
        }
        
        const result = await contract[method](...args);
        
        // Cache result
        if (cache) {
          this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Check if error indicates we should try another provider
        const shouldSwitchProvider = 
          error.message?.includes('timeout') || 
          error.message?.includes('rate limit') ||
          error.message?.includes('unknown block') ||
          error.message?.includes('network error');
        
        if (shouldSwitchProvider && attempt < maxRetries - 1) {
          // Try another provider
          await this.switchRpcProvider();
          
          // Recreate the contract with the new provider if necessary
          if (this.contracts.has(`${contract.target.toString().toLowerCase()}_provider`)) {
            const fragments = [...contract.interface.fragments];
            contract = this.getContract(contract.target.toString(), fragments);
          }
        } else if (!retry || attempt >= maxRetries - 1) {
          // Last attempt or retry disabled, break the loop
          break;
        }
      }
    }
    
    // All attempts failed
    if (lastError) {
      errorLogger.log('contractService', lastError, { 
        method: `${method}`,
        args,
        attempts: retry ? maxRetries : 1
      });
      throw lastError;
    }
    
    throw new Error(`Contract call failed: ${method}(${JSON.stringify(args)})`);
  }
  
  /**
   * Clear cache
   */
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get current wallet address
   */
  async getCurrentWalletAddress(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      return accounts[0] ? ethers.getAddress(accounts[0]) : null;
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getCurrentWalletAddress' });
      return null;
    }
  }
  
  /**
   * Get signer from browser wallet
   */
  async getSigner(): Promise<any> {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return await provider.getSigner();
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getSigner' });
      throw error;
    }
  }
}