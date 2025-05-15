// src/services/blockchain/contracts.ts
import { ethers, Contract, JsonRpcProvider, BrowserProvider, ContractRunner } from 'ethers';
import { CONTRACT_ADDRESSES, API_CONFIG } from '../../config/constants';
import { errorLogger } from '../../utils/error-logger';

// Import ABIs
import CardCatalogABI from '../../config/abis/CardCatalog.json';
import BookmarkNFTABI from '../../config/abis/BookmarkNFT.json';
import BookmarkVotingABI from '../../config/abis/BookmarkVoting.json';
import BookmarkRewardsABI from '../../config/abis/BookmarkRewards.json';
import BookmarkLeaderboardABI from '../../config/abis/BookmarkLeaderboard.json';
import BookmarkAuctionABI from '../../config/abis/BookmarkAuction.json';

// Type definitions for contract responses
interface UnbondingRequest {
  amount: bigint;
  releaseTime: number;
}

interface BookmarkData {
  exists: boolean;
  tokenURI: string;
  owner: string | null;
  title: string | null;
  author: string | null;
  metadataURI: string | null;
  creationTime?: number;
}

interface BookmarkRank {
  tokenId: string;
  votes: bigint;
  rank: number;
}

interface AuctionData {
  tokenId: string;
  nftContract: string;
  seller: string;
  startingPrice: bigint;
  reservePrice: bigint;
  currentBid: bigint;
  highestBidder: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
}

class ContractService {
  private provider: JsonRpcProvider;
  private contracts: Map<string, Contract> = new Map();
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  
  constructor() {
    this.provider = new JsonRpcProvider(API_CONFIG.RPC_URL);
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
   * Call contract method with caching
   */
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
      errorLogger.log('contractService', error, { method: `${method}`, args });
      throw new Error(`Contract call failed: ${method}(${JSON.stringify(args)}): ${error.message}`);
    }
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
      const provider = new BrowserProvider(window.ethereum);
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
      const provider = new BrowserProvider(window.ethereum);
      return await provider.getSigner();
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getSigner' });
      throw error;
    }
  }
  
  // #region Token & Staking Methods (CardCatalog)
  /**
   * Get NSI token balance
   */
  async getNSIBalance(address: string): Promise<bigint> {
    try {
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
        errorLogger.log('contractService', innerError, { method: 'getNSIBalance' });
        return BigInt(0); // Return zero instead of throwing
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getNSIBalance', address });
      return BigInt(0);
    }
  }
  
  /**
   * Get staked token balance
   */
  async getStakedBalance(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'balanceOf', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getStakedBalance' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getStakedBalance', address });
      return BigInt(0);
    }
  }
  
  /**
   * Stake (wrap) tokens
   */
  async wrapTokens(amount: string) {
    try {
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
      errorLogger.log('contractService', error, { method: 'wrapTokens', amount });
      throw new Error(`Failed to wrap tokens: ${error.message}`);
    }
  }
  
  /**
   * Request token withdrawal (unbonding)
   */
  async requestUnwrap(amount: string) {
    try {
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
      errorLogger.log('contractService', error, { method: 'requestUnwrap', amount });
      throw new Error(`Failed to request unwrap: ${error.message}`);
    }
  }
  
  /**
   * Complete token withdrawal after unbonding period
   */
  async completeUnwrap(requestIndex: number) {
    try {
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
      errorLogger.log('contractService', error, { method: 'completeUnwrap', requestIndex });
      throw new Error(`Failed to complete unwrap: ${error.message}`);
    }
  }
  
  /**
   * Get total voting power
   */
  async getVotingPower(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'getTotalVotingPower', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getVotingPower' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getVotingPower', address });
      return BigInt(0);
    }
  }
  
  /**
   * Get available voting power
   */
  async getAvailableVotingPower(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'getAvailableVotingPower', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getAvailableVotingPower' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getAvailableVotingPower', address });
      return BigInt(0);
    }
  }
  
  /**
   * Get unbonding requests
   */
  async getUnbondingRequests(address: string): Promise<UnbondingRequest[]> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<UnbondingRequest[]>(contract, 'getUnbondingRequests', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getUnbondingRequests' });
        return [];
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getUnbondingRequests', address });
      return [];
    }
  }
  // #endregion
  
  // #region Bookmark NFT (Evermark) Methods
  /**
   * Mint new bookmark (evermark)
   */
  async mintEvermark(to: string, metadataUri: string, title: string, author: string) {
    try {
      const signer = await this.getSigner();
      const formattedTo = ethers.getAddress(to);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI,
        signer
      );
      
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
      errorLogger.log('contractService', error, { method: 'mintEvermark', to });
      throw new Error(`Failed to mint evermark: ${error.message}`);
    }
  }
  
  /**
   * Get bookmark (evermark) data
   */
  async getEvermark(tokenId: string): Promise<BookmarkData> {
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
        
        return {
          exists,
          tokenURI,
          owner,
          title: bookmarkData ? bookmarkData[0] : null,
          author: bookmarkData ? bookmarkData[1] : null,
          metadataURI: bookmarkData ? bookmarkData[2] : null,
        };
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getEvermark:inner' });
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
      errorLogger.log('contractService', error, { method: 'getEvermark', tokenId });
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
  
  /**
   * Update bookmark (evermark) metadata
   */
  async updateEvermarkMetadata(tokenId: string, metadataURI: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI,
        signer
      );
      
      const tx = await contract.updateBookmarkMetadata(tokenId, metadataURI);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'updateEvermarkMetadata', tokenId });
      throw new Error(`Failed to update evermark metadata: ${error.message}`);
    }
  }
  
  /**
   * Get user's bookmarks (evermarks)
   */
  async getUserEvermarks(address: string): Promise<string[]> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      
      try {
        // Get all tokens owned by the user
        const balance = await this.callContract<bigint>(contract, 'balanceOf', [formattedAddress]);
        
        // Query Transfer events to find tokens
        const filter = contract.filters.Transfer(null, formattedAddress);
        const events = await contract.queryFilter(filter);
        
        // Extract token IDs
        const tokenIds = events.map(event => 
          'args' in event ? event.args[2].toString() : ''
        ).filter(Boolean);
        
        return tokenIds;
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getUserEvermarks:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getUserEvermarks', address });
      return [];
    }
  }
  
  /**
   * Get total number of evermarks
   */
  async getTotalEvermarks(): Promise<number> {
    try {
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      
      try {
        const totalSupply = await this.callContract<bigint>(contract, 'totalSupply', []);
        return Number(totalSupply);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getTotalEvermarks:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getTotalEvermarks' });
      return 0;
    }
  }
  // #endregion
  
  // #region Voting Methods
  /**
   * Get bookmark votes
   */
  async getBookmarkVotes(evermarkId: string): Promise<bigint> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(votingContract, 'getBookmarkVotes', [evermarkId]);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getBookmarkVotes:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getBookmarkVotes', evermarkId });
      return BigInt(0);
    }
  }
  
  /**
   * Delegate votes to a bookmark
   */
  async delegateVotes(evermarkId: string, amount: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.delegateVotes(evermarkId, amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'delegateVotes', evermarkId, amount });
      throw new Error(`Failed to delegate votes: ${error.message}`);
    }
  }
  
  /**
   * Undelegate votes from a bookmark
   */
  async undelegateVotes(evermarkId: string, amount: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.undelegateVotes(evermarkId, amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'undelegateVotes', evermarkId, amount });
      throw new Error(`Failed to undelegate votes: ${error.message}`);
    }
  }
  
  /**
   * Get user votes for a bookmark
   */
  async getUserVotesForBookmark(userAddress: string, bookmarkId: string): Promise<bigint> {
    try {
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
        errorLogger.log('contractService', innerError, { method: 'getUserVotesForBookmark:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getUserVotesForBookmark', userAddress, bookmarkId });
      return BigInt(0);
    }
  }
  
  /**
   * Get total user votes in current cycle
   */
  async getTotalUserVotesInCurrentCycle(userAddress: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(userAddress);
      
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(
          votingContract, 
          'getTotalUserVotesInCurrentCycle', 
          [formattedAddress]
        );
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getTotalUserVotesInCurrentCycle:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getTotalUserVotesInCurrentCycle', userAddress });
      return BigInt(0);
    }
  }
  
  /**
   * Get bookmarks with votes in cycle
   */
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
        errorLogger.log('contractService', innerError, { method: 'getBookmarksWithVotesInCycle:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getBookmarksWithVotesInCycle', cycle });
      return [];
    }
  }
  
  /**
   * Get current voting cycle
   */
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
        errorLogger.log('contractService', innerError, { method: 'getCurrentCycle:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getCurrentCycle' });
      return 0;
    }
  }
  
  /**
   * Get time remaining in current cycle
   */
  async getTimeRemainingInCurrentCycle(): Promise<number> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        const timeRemaining = await this.callContract<bigint>(votingContract, 'getTimeRemainingInCurrentCycle', []);
        return Number(timeRemaining);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getTimeRemainingInCurrentCycle:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getTimeRemainingInCurrentCycle' });
      return 0;
    }
  }
  // #endregion
  
  // #region Rewards Methods
  /**
   * Get pending rewards
   */
  async getPendingRewards(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const rewardsContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_REWARDS,
        BookmarkRewardsABI
      );

      try {
        return await this.callContract<bigint>(rewardsContract, 'getPendingRewards', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getPendingRewards:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getPendingRewards', address });
      return BigInt(0);
    }
  }
  
  /**
   * Claim rewards
   */
  async claimRewards() {
    try {
      const signer = await this.getSigner();
      
      const rewardsContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_REWARDS,
        BookmarkRewardsABI,
        signer
      );
      
      const tx = await rewardsContract.claimRewards();
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'claimRewards' });
      throw new Error(`Failed to claim rewards: ${error.message}`);
    }
  }
  
  /**
   * Update staking power
   */
  async updateStakingPower() {
    try {
      const signer = await this.getSigner();
      
      const rewardsContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_REWARDS,
        BookmarkRewardsABI,
        signer
      );
      
      const tx = await rewardsContract.updateStakingPower();
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'updateStakingPower' });
      throw new Error(`Failed to update staking power: ${error.message}`);
    }
  }
  // #endregion
  
  // #region Leaderboard Methods
  /**
   * Get weekly top bookmarks
   */
  async getWeeklyTopBookmarks(weekNumber: number, count: number = 10): Promise<BookmarkRank[]> {
    try {
      const leaderboardContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_LEADERBOARD,
        BookmarkLeaderboardABI
      );

      try {
        return await this.callContract<BookmarkRank[]>(
          leaderboardContract, 
          'getWeeklyTopBookmarks', 
          [weekNumber, count]
        );
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getWeeklyTopBookmarks:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getWeeklyTopBookmarks', weekNumber, count });
      return [];
    }
  }
  
  /**
   * Get bookmark rank for week
   */
  async getBookmarkRankForWeek(weekNumber: number, bookmarkId: string): Promise<number> {
    try {
      const leaderboardContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_LEADERBOARD,
        BookmarkLeaderboardABI
      );

      try {
        const rank = await this.callContract<bigint>(
          leaderboardContract, 
          'getBookmarkRankForWeek', 
          [weekNumber, bookmarkId]
        );
        return Number(rank);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getBookmarkRankForWeek:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getBookmarkRankForWeek', weekNumber, bookmarkId });
      return 0;
    }
  }
  
  /**
   * Check if leaderboard is finalized
   */
  async isLeaderboardFinalized(weekNumber: number): Promise<boolean> {
    try {
      const leaderboardContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_LEADERBOARD,
        BookmarkLeaderboardABI
      );

      try {
        return await this.callContract<boolean>(
          leaderboardContract, 
          'isLeaderboardFinalized', 
          [weekNumber]
        );
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'isLeaderboardFinalized:inner' });
        return false;
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'isLeaderboardFinalized', weekNumber });
      return false;
    }
  }
  // #endregion
  
  // #region Auction Methods
  /**
   * Create auction
   */
  async createAuction(
    nftContract: string,
    tokenId: string,
    startingPrice: string,
    reservePrice: string,
    duration: number
  ) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const startingPriceWei = ethers.parseEther(startingPrice);
      const reservePriceWei = ethers.parseEther(reservePrice);
      
      const tx = await auctionContract.createAuction(
        nftContract,
        tokenId,
        startingPriceWei,
        reservePriceWei,
        duration
      );
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { 
        method: 'createAuction', 
        nftContract, 
        tokenId,
        startingPrice,
        reservePrice,
        duration
      });
      throw new Error(`Failed to create auction: ${error.message}`);
    }
  }
  
  /**
   * Place bid
   */
  async placeBid(auctionId: string, amount: string) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await auctionContract.placeBid(auctionId, { value: amountWei });
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'placeBid', auctionId, amount });
      throw new Error(`Failed to place bid: ${error.message}`);
    }
  }
  
  /**
   * Finalize auction
   */
  async finalizeAuction(auctionId: string) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const tx = await auctionContract.finalizeAuction(auctionId);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'finalizeAuction', auctionId });
      throw new Error(`Failed to finalize auction: ${error.message}`);
    }
  }
  
  /**
   * Cancel auction
   */
  async cancelAuction(auctionId: string) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const tx = await auctionContract.cancelAuction(auctionId);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('contractService', error, { method: 'cancelAuction', auctionId });
      throw new Error(`Failed to cancel auction: ${error.message}`);
    }
  }
  
  /**
   * Get auction details
   */
  async getAuctionDetails(auctionId: string): Promise<AuctionData | null> {
    try {
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI
      );

      try {
        const auctionData = await this.callContract<AuctionData>(
          auctionContract, 
          'getAuctionDetails', 
          [auctionId]
        );
        return auctionData;
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getAuctionDetails:inner' });
        return null;
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getAuctionDetails', auctionId });
      return null;
    }
  }
  
  /**
   * Get active auctions
   */
  async getActiveAuctions(): Promise<string[]> {
    try {
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI
      );

      try {
        return await this.callContract<string[]>(auctionContract, 'getActiveAuctions', []);
      } catch (innerError) {
        errorLogger.log('contractService', innerError, { method: 'getActiveAuctions:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('contractService', error, { method: 'getActiveAuctions' });
      return [];
    }
  }
  // #endregion
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