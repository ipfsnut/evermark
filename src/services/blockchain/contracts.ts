// src/services/blockchain/contracts.ts
import { ethers, Contract, JsonRpcProvider, BrowserProvider } from 'ethers';
import { CONTRACT_ADDRESSES } from '../../config/constants';
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
    this.provider = new JsonRpcProvider('https://mainnet.base.org');
  }
  
  // Get contract instance
  private getContract(address: string, abi: any[]): Contract {
    const key = address.toLowerCase();
    
    if (!this.contracts.has(key)) {
      const contract = new Contract(address, abi, this.provider);
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
  
  // Bookmark NFT methods (used as Evermark)
  async mintEvermark(to: string, metadataUri: string, title: string, author: string) {
    try {
      // Get signer from browser
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get contract with signer
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      const contractWithSigner = contract.connect(signer);
      
      // Call mintBookmarkFor (using the actual method from BookmarkNFT)
      const tx = await contractWithSigner.mintBookmarkFor(
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
      
      const result = { exists, tokenURI, owner };
      
      if (bookmarkData) {
        return {
          ...result,
          title: bookmarkData[0],
          author: bookmarkData[1],
          metadataURI: bookmarkData[2],
        };
      }
      
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
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      const contractWithSigner = contract.connect(signer);
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contractWithSigner.wrap(amountWei);
      
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
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      const contractWithSigner = contract.connect(signer);
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contractWithSigner.requestUnwrap(amountWei);
      
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
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.completeUnwrap(requestIndex);
      
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
  
  // Voting methods
  async delegateVotes(evermarkId: string, amount: string) {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );
      const contractWithSigner = contract.connect(signer);
      
      // The voting contract expects bookmarkId, not evermarkId
      const voteData = translationService.prepareVotingData(evermarkId, amount);
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contractWithSigner.delegateVotes(voteData.bookmarkId, amountWei);
      
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