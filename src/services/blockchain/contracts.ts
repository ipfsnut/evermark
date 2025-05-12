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
    const key = `${address.toLowerCase()}_${runner ? 'signer' : 'provider'}`;
    
    if (!this.contracts.has(key)) {
      const contract = new Contract(address, abi, runner || this.provider);
      this.contracts.set(key, contract);
    }
    
    return this.contracts.get(key)!;
  }
  
  // Get voting contract specifically
  public getVotingContract(useSigner = false): Promise<Contract> {
    return this.getSigner().then(signer => {
      return this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI,
        useSigner ? signer : undefined
      );
    });
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
      throw new Error(`Contract call failed: ${error.message}`);
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
      return accounts[0] || null;
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
  
  // Add missing getNSIBalance method
  async getNSIBalance(address: string): Promise<bigint> {
    const nsiContract = this.getContract(
      CONTRACT_ADDRESSES.NSI_TOKEN,
      [
        "function balanceOf(address) view returns (uint256)"
      ]
    );
    
    try {
      return await this.callContract<bigint>(nsiContract, 'balanceOf', [address]);
    } catch (error) {
      throw new Error(`Failed to get NSI balance: ${error}`);
    }
  }
  
  // Bookmark NFT methods (used as Evermark)
  async mintEvermark(to: string, metadataUri: string, title: string, author: string) {
    try {
      // Check if window.ethereum exists
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }
      
      // Get signer from browser
      const signer = await this.getSigner();
      
      // Get contract with signer
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI,
        signer
      );
      
      // Call mintBookmarkFor (using the actual method from BookmarkNFT)
      const tx = await contract.mintBookmarkFor(
        to,
        metadataUri,
        title,
        author // This is "contentCreator" in the contract
      );
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      throw new Error(`Failed to mint evermark: ${error.message}`);
    }
  }
  
  async getEvermark(tokenId: string) {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.BOOKMARK_NFT,
      BookmarkNFTABI
    );
    
    try {
      const [exists, tokenURI, owner, bookmarkData] = await Promise.all([
        this.callContract<boolean>(contract, 'exists', [tokenId]),
        this.callContract<string>(contract, 'tokenURI', [tokenId]),
        this.callContract<string>(contract, 'ownerOf', [tokenId]).catch(() => null),
        this.callContract<[string, string, string]>(contract, 'getBookmarkMetadata', [tokenId]).catch(() => null),
      ]);
      
      // Always return the same structure, but with some fields potentially null
      const result = {
        exists,
        tokenURI,
        owner,
        title: bookmarkData ? bookmarkData[0] : null,
        author: bookmarkData ? bookmarkData[1] : null,
        metadataURI: bookmarkData ? bookmarkData[2] : null,
      };
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get evermark: ${error}`);
    }
  }
  
  async getUserEvermarks(address: string): Promise<string[]> {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.BOOKMARK_NFT,
      BookmarkNFTABI
    );
    
    try {
      // Get all tokens owned by the user
      const balance = await this.callContract<bigint>(contract, 'balanceOf', [address]);
      const tokenIds: string[] = [];
      
      // Note: BookmarkNFT doesn't have a tokensOfOwner method
      // We need to implement a different approach or use events
      
      // For now, return empty array and rely on database/events
      return tokenIds;
    } catch (error) {
      throw new Error(`Failed to get user evermarks: ${error}`);
    }
  }
  
  // Card Catalog methods for staking
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
      throw new Error(`Failed to complete unwrap: ${error.message}`);
    }
  }
  
  async getStakedBalance(address: string): Promise<bigint> {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.CARD_CATALOG,
      CardCatalogABI
    );
    
    try {
      return await this.callContract<bigint>(contract, 'balanceOf', [address]);
    } catch (error) {
      throw new Error(`Failed to get staked balance: ${error}`);
    }
  }
  
  async getVotingPower(address: string): Promise<bigint> {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.CARD_CATALOG,
      CardCatalogABI
    );
    
    try {
      return await this.callContract<bigint>(contract, 'getTotalVotingPower', [address]);
    } catch (error) {
      throw new Error(`Failed to get voting power: ${error}`);
    }
  }
  
  async getAvailableVotingPower(address: string): Promise<bigint> {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.CARD_CATALOG,
      CardCatalogABI
    );
    
    try {
      return await this.callContract<bigint>(contract, 'getAvailableVotingPower', [address]);
    } catch (error) {
      throw new Error(`Failed to get available voting power: ${error}`);
    }
  }
  
  async getUnbondingRequests(address: string) {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.CARD_CATALOG,
      CardCatalogABI
    );
    
    try {
      return await this.callContract<any[]>(contract, 'getUnbondingRequests', [address]);
    } catch (error) {
      throw new Error(`Failed to get unbonding requests: ${error}`);
    }
  }
  
  // Get bookmark votes
  async getBookmarkVotes(evermarkId: string): Promise<bigint> {
    const votingContract = this.getContract(
      CONTRACT_ADDRESSES.BOOKMARK_VOTING,
      BookmarkVotingABI
    );

    try {
      // No need for translation since we're directly calling the contract method
      return await this.callContract<bigint>(votingContract, 'getBookmarkVotes', [evermarkId]);
    } catch (error) {
      throw new Error(`Failed to get bookmark votes: ${error}`);
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
      throw new Error(`Failed to delegate votes: ${error.message}`);
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