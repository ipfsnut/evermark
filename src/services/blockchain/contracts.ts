// src/services/blockchain/contracts.ts
import { ethers, Contract, JsonRpcProvider, BrowserProvider, ContractRunner } from 'ethers';
import { CONTRACT_ADDRESSES, API_CONFIG } from '../../config/constants';
import { translationService } from './translation';

// Import the correct ABIs
import CardCatalogABI from '../../config/abis/CardCatalog.json';
import BookmarkNFTABI from '../../config/abis/BookmarkNFT.json';
import BookmarkVotingABI from '../../config/abis/BookmarkVoting.json';
import BookmarkRewardsABI from '../../config/abis/BookmarkRewards.json';
import BookmarkLeaderboardABI from '../../config/abis/BookmarkLeaderboard.json';
import BookmarkAuctionABI from '../../config/abis/BookmarkAuction.json';

class ContractService {
  private provider: JsonRpcProvider;
  private contracts: Map<string, Contract> = new Map();
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  
  constructor() {
    this.provider = new JsonRpcProvider(API_CONFIG.RPC_URL);
  }
  
  // Changed from private to public so it can be used by other services
  public getContract(address: string, abi: any[], runner?: ContractRunner): Contract {
    // Ensure address is properly formatted
    const formattedAddress = ethers.getAddress(address);
    const key = `${formattedAddress.toLowerCase()}_${runner ? 'signer' : 'provider'}`;
    
    if (!this.contracts.has(key)) {
      const contract = new Contract(formattedAddress, abi, runner || this.provider);
      this.contracts.set(key, contract);
    }
    
    return this.contracts.get(key)!;
  }
  
  // Call contract method with caching
  async callContract<T>(
    contract: Contract,
    method: string,
    args: any[] = [],
    options: { cache?: boolean; cacheTime?: number } = {}
  ): Promise<T> {
    const { cache = true, cacheTime = 30000 } = options;
    const cacheKey = `${contract.target}_${method}_${JSON.stringify(args)}`;
    
    // Check cache
    if (cache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        return cached.value;
      }
    }
    
    try {
      const result = await contract[method](...args);
      
      // Cache result
      if (cache) {
        this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
      }
      
      return result;
    } catch (error: any) {
      console.warn(`Contract call failed: ${method}(${JSON.stringify(args)}): ${error.message}`);
      throw error;
    }
  }
  
  // Clear cache
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

  // Get current wallet address from ethereum provider
  async getCurrentWalletAddress(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      return accounts[0] ? ethers.getAddress(accounts[0]) : null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }
  
  // Get signer from the browser wallet
  async getSigner(): Promise<any> {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      return await provider.getSigner();
    } catch (error) {
      console.error('Failed to get signer:', error);
      throw error;
    }
  }
  
  // Add missing getNSIBalance method with robust error handling
  async getNSIBalance(address: string): Promise<bigint> {
    try {
      // Format address to ensure correct checksum
      const formattedAddress = ethers.getAddress(address);
      
      const nsiContract = this.getContract(
        CONTRACT_ADDRESSES.NSI_TOKEN,
        [
          "function balanceOf(address) view returns (uint256)"
        ]
      );
      
      try {
        return await this.callContract<bigint>(nsiContract, 'balanceOf', [formattedAddress]);
      } catch (innerError) {
        console.warn(`Contract call to getNSIBalance failed: ${innerError}`);
        return BigInt(0); // Return zero instead of throwing
      }
    } catch (error) {
      console.warn('Failed to get NSI balance, returning 0:', error);
      return BigInt(0); // Return 0 as a fallback instead of throwing
    }
  }
  
  // Bookmark NFT methods (used as Evermark)
  async mintEvermark(to: string, metadataUri: string, title: string, author: string) {
    try {
      // Get signer from browser
      const signer = await this.getSigner();
      // Format address
      const formattedTo = ethers.getAddress(to);
      
      // Get contract with signer
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI,
        signer
      );
      
      // Call mintBookmarkFor (using the actual method from BookmarkNFT)
      const tx = await contract.mintBookmarkFor(
        formattedTo,
        metadataUri,
        title,
        author // This is "contentCreator" in the contract
      );
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      console.error('Failed to mint evermark:', error);
      throw new Error(`Failed to mint evermark: ${error.message}`);
    }
  }
  
  async getEvermark(tokenId: string) {
    try {
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      
      try {
        const [exists, tokenURI, owner, bookmarkData] = await Promise.all([
          this.callContract<boolean>(contract, 'exists', [tokenId]).catch(() => false),
          this.callContract<string>(contract, 'tokenURI', [tokenId]).catch(() => ''),
          this.callContract<string>(contract, 'ownerOf', [tokenId]).catch(() => null),
          this.callContract<[string, string, string]>(contract, 'getBookmarkMetadata', [tokenId]).catch(() => null),
        ]);
        
        // Always return the same structure, but with some fields potentially null
        return {
          exists,
          tokenURI,
          owner,
          title: bookmarkData ? bookmarkData[0] : null,
          author: bookmarkData ? bookmarkData[1] : null,
          metadataURI: bookmarkData ? bookmarkData[2] : null,
        };
      } catch (innerError) {
        console.warn(`Inner calls for getEvermark failed: ${innerError}`);
        return {
          exists: false,
          tokenURI: '',
          owner: null,
          title: null,
          author: null,
          metadataURI: null,
        };
      }
    } catch (error) {
      console.warn('Failed to get evermark, returning default:', error);
      return {
        exists: false,
        tokenURI: '',
        owner: null,
        title: null,
        author: null,
        metadataURI: null,
      };
    }
  }
  
  async getUserEvermarks(address: string): Promise<string[]> {
    try {
      // Format address
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      
      try {
        // Get all tokens owned by the user
        const balance = await this.callContract<bigint>(contract, 'balanceOf', [formattedAddress]);
        
        // Note: BookmarkNFT doesn't have a tokensOfOwner method
        // We need to implement a different approach or use events
        
        // For now, query Transfer events to find tokens
        const filter = contract.filters.Transfer(null, formattedAddress);
        const events = await contract.queryFilter(filter);
        
        // Extract token IDs
        const tokenIds = events.map(event => 
          'args' in event ? event.args[2].toString() : ''
        ).filter(Boolean);
        
        return tokenIds;
      } catch (innerError) {
        console.warn(`Inner calls for getUserEvermarks failed: ${innerError}`);
        return []; // Return empty array instead of throwing
      }
    } catch (error) {
      console.warn('Failed to get user evermarks, returning empty array:', error);
      return [];
    }
  }
  
  // Card Catalog methods for staking with robust error handling
  async getStakedBalance(address: string): Promise<bigint> {
    try {
      // Format address
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'balanceOf', [formattedAddress]);
      } catch (innerError) {
        console.warn(`Contract call to balanceOf failed: ${innerError}`);
        return BigInt(0); // Return zero instead of throwing
      }
    } catch (error) {
      console.warn('Failed to get staked balance, returning 0:', error);
      return BigInt(0); // Return 0 as a fallback instead of throwing
    }
  }
  
  async wrapTokens(amount: string) {
    try {
      // Get signer
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.wrap(amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      console.error('Failed to wrap tokens:', error);
      throw new Error(`Failed to wrap tokens: ${error.message}`);
    }
  }
  
  async requestUnwrap(amount: string) {
    try {
      // Get signer
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.requestUnwrap(amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      console.error('Failed to request unwrap:', error);
      throw new Error(`Failed to request unwrap: ${error.message}`);
    }
  }
  
  async completeUnwrap(requestIndex: number) {
    try {
      // Get signer
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI,
        signer
      );
      
      const tx = await contract.completeUnwrap(requestIndex);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      console.error('Failed to complete unwrap:', error);
      throw new Error(`Failed to complete unwrap: ${error.message}`);
    }
  }
  
  async getVotingPower(address: string): Promise<bigint> {
    try {
      // Format address to ensure correct checksum
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'getTotalVotingPower', [formattedAddress]);
      } catch (innerError) {
        console.warn(`Contract call to getTotalVotingPower failed: ${innerError}`);
        return BigInt(0);
      }
    } catch (error) {
      console.warn('Failed to get voting power, returning 0:', error);
      return BigInt(0);
    }
  }
  
  async getAvailableVotingPower(address: string): Promise<bigint> {
    try {
      // Format address to ensure correct checksum
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'getAvailableVotingPower', [formattedAddress]);
      } catch (innerError) {
        console.warn(`Contract call to getAvailableVotingPower failed: ${innerError}`);
        return BigInt(0);
      }
    } catch (error) {
      console.warn('Failed to get available voting power, returning 0:', error);
      return BigInt(0);
    }
  }
  
  async getUnbondingRequests(address: string) {
    try {
      // Format address
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<any[]>(contract, 'getUnbondingRequests', [formattedAddress]);
      } catch (innerError) {
        console.warn(`Contract call to getUnbondingRequests failed: ${innerError}`);
        return []; // Return empty array instead of throwing
      }
    } catch (error) {
      console.warn('Failed to get unbonding requests, returning empty array:', error);
      return [];
    }
  }
  
  // Get bookmark votes
  async getBookmarkVotes(evermarkId: string): Promise<bigint> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(votingContract, 'getBookmarkVotes', [evermarkId]);
      } catch (innerError) {
        console.warn(`Contract call to getBookmarkVotes failed: ${innerError}`);
        return BigInt(0);
      }
    } catch (error) {
      console.warn('Failed to get bookmark votes, returning 0:', error);
      return BigInt(0);
    }
  }
  
  // Voting methods
  async delegateVotes(evermarkId: string, amount: string) {
    try {
      // Get signer
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI,
        signer
      );
      
      // The voting contract expects bookmarkId, not evermarkId
      const voteData = translationService.prepareVotingData(evermarkId, amount);
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.delegateVotes(voteData.bookmarkId, amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      console.error('Failed to delegate votes:', error);
      throw new Error(`Failed to delegate votes: ${error.message}`);
    }
  }
  
  // Get user votes for a bookmark
  async getUserVotesForBookmark(userAddress: string, bookmarkId: string): Promise<bigint> {
    try {
      // Format address
      const formattedAddress = ethers.getAddress(userAddress);
      
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(
          votingContract, 
          'getUserVotesForBookmark', 
          [formattedAddress, bookmarkId]
        );
      } catch (innerError) {
        console.warn(`Contract call to getUserVotesForBookmark failed: ${innerError}`);
        return BigInt(0);
      }
    } catch (error) {
      console.warn('Failed to get user votes for bookmark, returning 0:', error);
      return BigInt(0);
    }
  }
  
  // Get all bookmarks with votes in cycle
  async getBookmarksWithVotesInCycle(cycle: number): Promise<string[]> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<string[]>(
          votingContract, 
          'getBookmarksWithVotesInCycle', 
          [cycle]
        );
      } catch (innerError) {
        console.warn(`Contract call to getBookmarksWithVotesInCycle failed: ${innerError}`);
        return [];
      }
    } catch (error) {
      console.warn('Failed to get bookmarks with votes, returning empty array:', error);
      return [];
    }
  }
  
  // Get current voting cycle
  async getCurrentCycle(): Promise<number> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        const cycle = await this.callContract<bigint>(votingContract, 'getCurrentCycle', []);
        return Number(cycle);
      } catch (innerError) {
        console.warn(`Contract call to getCurrentCycle failed: ${innerError}`);
        return 0;
      }
    } catch (error) {
      console.warn('Failed to get current cycle, returning 0:', error);
      return 0;
    }
  }
}

export const contractService = new ContractService();

// Helper functions
export const formatEther = (value: bigint | string): string => {
  try {
    return ethers.formatEther(value);
  } catch (error) {
    return '0';
  }
};

export const parseEther = (value: string): bigint => {
  try {
    return ethers.parseEther(value);
  } catch (error) {
    return BigInt(0);
  }
};
