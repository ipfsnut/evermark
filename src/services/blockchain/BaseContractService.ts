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
  protected localStorageCache: boolean = true;
  
  // RPC management
  protected rpcUrls = [
    'https://mainnet.base.org',
    'https://base-mainnet.public.blastapi.io',
    'https://base.llamarpc.com',
    'https://base.blockpi.network/v1/rpc/public'
  ];
  
  protected currentRpcIndex = 0;
  protected lastProviderSwitch = 0;
  protected networkStatus: 'connected' | 'connecting' | 'error' = 'connecting';
  protected switchingProvider = false;
  
  // Rate limiting
  protected lastCallTimestamp: number = 0;
  protected callCounter: number = 0;
  protected readonly MAX_CALLS_PER_MINUTE: number = 60;
  protected readonly MAX_BATCH_SIZE: number = 3;
  protected pendingRequests: Map<string, Promise<any>> = new Map();
  
  constructor(initialRpcUrl?: string) {
    if (initialRpcUrl) {
      this.rpcUrls.unshift(initialRpcUrl); // Add user-provided URL as first option
    }
    this.provider = new JsonRpcProvider(this.rpcUrls[0]);
    this.checkConnection();
    
    // Set up auto-reset of call counter
    setInterval(() => {
      this.callCounter = 0;
      this.lastCallTimestamp = Date.now();
    }, 60000); // Reset every minute
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
      
      // Try another provider if this one failed
      if (this.rpcUrls.length > 1) {
        await sleep(1000); // Wait a bit before trying again
        return this.switchRpcProvider();
      }
      
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
   * Rate-limit a contract method call
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    
    // Check if we've exceeded the rate limit
    if (now - this.lastCallTimestamp < 60000) { // Within a minute window
      if (this.callCounter >= this.MAX_CALLS_PER_MINUTE) {
        const waitTime = 60000 - (now - this.lastCallTimestamp) + 100; // Wait until next minute + buffer
        console.warn(`Rate limit reached. Waiting ${waitTime}ms before next call.`);
        await sleep(waitTime);
        this.callCounter = 0;
        this.lastCallTimestamp = Date.now();
      }
    } else {
      // Reset counter for new minute
      this.lastCallTimestamp = now;
      this.callCounter = 0;
    }
    
    this.callCounter++;
  }
  
  /**
   * Get from local storage cache
   */
  private getFromLocalStorageCache<T>(key: string): { value: T; timestamp: number } | null {
    if (!this.localStorageCache) return null;
    
    try {
      const cached = localStorage.getItem(`contract_cache_${key}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to get from localStorage cache:', e);
    }
    
    return null;
  }
  
  /**
   * Save to local storage cache
   */
  private saveToLocalStorageCache(key: string, value: any, timestamp: number): void {
    if (!this.localStorageCache) return;
    
    try {
      // Don't cache BigInt values directly as they can't be serialized
      const serializable = JSON.parse(JSON.stringify(value, (_, v) => 
        typeof v === 'bigint' ? v.toString() : v
      ));
      
      localStorage.setItem(`contract_cache_${key}`, JSON.stringify({ 
        value: serializable, 
        timestamp 
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage cache:', e);
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
      useLocalStorage?: boolean;
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const { 
      cache = true, 
      cacheTime = 30000, 
      retry = true,
      maxRetries = 5,
      retryBaseDelay = 1000,
      useLocalStorage = true,
      forceRefresh = false
    } = options;
    
    // Create a cache key
    const cacheKey = `${contract.target}_${method}_${JSON.stringify(args)}`;
    
    // Deduplicate identical in-flight requests
    if (!forceRefresh && this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    // Check memory cache first
    if (!forceRefresh && cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        return cached.value;
      }
      
      // Then check localStorage cache if enabled
      if (useLocalStorage && this.localStorageCache) {
        const localCached = this.getFromLocalStorageCache<T>(cacheKey);
        if (localCached && Date.now() - localCached.timestamp < cacheTime) {
          // Store in memory cache too
          this.cache.set(cacheKey, localCached);
          return localCached.value;
        }
      }
    }
    
    // Create the request promise
    const requestPromise = (async () => {
      // Apply rate limiting
      await this.rateLimit();
      
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
            const timestamp = Date.now();
            this.cache.set(cacheKey, { value: result, timestamp });
            
            // Also cache to localStorage if enabled
            if (useLocalStorage && this.localStorageCache) {
              this.saveToLocalStorageCache(cacheKey, result, timestamp);
            }
          }
          
          // Remove from pending requests
          this.pendingRequests.delete(cacheKey);
          
          return result;
        } catch (error: any) {
          lastError = error;
          
          // Check if error indicates we should try another provider
          const shouldSwitchProvider = 
            error.message?.includes('timeout') || 
            error.message?.includes('rate limit') ||
            error.message?.includes('unknown block') ||
            error.message?.includes('network error') ||
            error.message?.includes('too many requests') ||
            error.message?.includes('server error') ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNRESET' ||
            error.code === -32000 || // Generic RPC error
            error.code === -32603; // Internal error
          
          if (shouldSwitchProvider && attempt < maxRetries - 1) {
            // Try another provider
            await this.switchRpcProvider();
            
            // Recreate the contract with the new provider if necessary
            if (this.contracts.has(`${contract.target.toString().toLowerCase()}_provider`)) {
              const fragments = [...contract.interface.fragments];
              const newContract = this.getContract(contract.target.toString(), fragments);
              contract = newContract;
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
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        throw lastError;
      }
      
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
      
      throw new Error(`Contract call failed: ${method}(${JSON.stringify(args)})`);
    })();
    
    // Store the promise for deduplication
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Call multiple contract methods in batches to avoid rate limits
   */
  async batchCallContract<T>(
    contract: Contract,
    calls: Array<{ method: string; args: any[]; }>,
    options: {
      batchSize?: number;
      delayMs?: number;
      cache?: boolean;
      cacheTime?: number;
    } = {}
  ): Promise<T[]> {
    const { 
      batchSize = this.MAX_BATCH_SIZE, 
      delayMs = 500,
      cache = true,
      cacheTime = 30000
    } = options;
    
    return processBatch(
      calls,
      batchSize,
      async (call) => {
        try {
          return await this.callContract<T>(
            contract, 
            call.method, 
            call.args,
            { cache, cacheTime }
          );
        } catch (e) {
          console.error(`Error in batch call to ${call.method}:`, e);
          throw e;
        }
      },
      delayMs
    );
  }
  
  /**
   * Clear all cache or pattern-matched keys
   */
  clearCache(pattern?: string) {
    // Clear memory cache
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    
    // Clear localStorage cache if enabled
    if (this.localStorageCache) {
      if (pattern) {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('contract_cache_') && key.includes(pattern)) {
            localStorage.removeItem(key);
          }
        }
      } else {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('contract_cache_')) {
            localStorage.removeItem(key);
          }
        }
      }
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
  
  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Enable or disable localStorage caching
   */
  setLocalStorageCaching(enabled: boolean): void {
    if (enabled && !this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available, caching will remain disabled');
      this.localStorageCache = false;
    } else {
      this.localStorageCache = enabled;
    }
  }
}