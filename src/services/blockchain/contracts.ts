import { ethers, Contract, JsonRpcProvider, BrowserProvider } from 'ethers';
import { CONTRACT_ADDRESSES } from '../../config/constants';

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
  
  // Evermark NFT methods (adapted from bookmark)
  async getEvermark(tokenId: string) {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.EVERMARK_NFT,
      [
        "function exists(uint256 tokenId) view returns (bool)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)"
      ]
    );
    
    try {
      const [exists, tokenURI, owner] = await Promise.all([
        this.callContract<boolean>(contract, 'exists', [tokenId]),
        this.callContract<string>(contract, 'tokenURI', [tokenId]),
        this.callContract<string>(contract, 'ownerOf', [tokenId]).catch(() => null),
      ]);
      
      return { exists, tokenURI, owner };
    } catch (error) {
      throw new Error(`Failed to get evermark: ${error}`);
    }
  }
  
  async getUserEvermarks(address: string): Promise<string[]> {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.EVERMARK_NFT,
      ["function tokensOfOwner(address owner) view returns (uint256[])"]
    );
    
    try {
      const tokenIds = await this.callContract<bigint[]>(contract, 'tokensOfOwner', [address]);
      return tokenIds.map(id => id.toString());
    } catch (error) {
      throw new Error(`Failed to get user evermarks: ${error}`);
    }
  }
  
  async mintEvermark(to: string, metadataUri: string) {
    try {
      // Get signer from browser
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get contract with signer
      const contract = this.getContract(
        CONTRACT_ADDRESSES.EVERMARK_NFT,
        ["function mint(address to, string memory uri) returns (uint256)"]
      );
      const contractWithSigner = contract.connect(signer);
      
      // Call mint function
      const tx = await contractWithSigner.mint(to, metadataUri);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      throw new Error(`Failed to mint evermark: ${error.message}`);
    }
  }
  
  // Card Catalog methods
  async getStakedBalance(address: string): Promise<bigint> {
    const contract = this.getContract(
      CONTRACT_ADDRESSES.CARD_CATALOG,
      ["function balanceOf(address owner) view returns (uint256)"]
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
      ["function getVotingPower(address owner) view returns (uint256)"]
    );
    
    try {
      return await this.callContract<bigint>(contract, 'getVotingPower', [address]);
    } catch (error) {
      throw new Error(`Failed to get voting power: ${error}`);
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