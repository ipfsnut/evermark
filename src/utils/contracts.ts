import { 
    contractService, 
    formatBigInt, 
    parseToBigInt, 
    useBalances,
    useContractService,
    contractEvents
  } from '../services/contract.service';
  import { CONTRACT_ADDRESSES } from '../config/constants';
  
  // Import the ABIs (need to be copied from bookmarks and renamed)
  import CardCatalogABI from '../config/abis/CardCatalog.json';
  import EvermarkNFTABI from '../config/abis/BookmarkNFT.json'; // Renamed from BookmarkNFT
  import EvermarkVotingABI from '../config/abis/BookmarkVoting.json'; // Renamed from BookmarkVoting
  import EvermarkLeaderboardABI from '../config/abis/BookmarkLeaderboard.json'; // Renamed from BookmarkLeaderboard
  import EvermarkRewardsABI from '../config/abis/BookmarkRewards.json'; // Renamed from BookmarkRewards
  import EvermarkAuctionABI from '../config/abis/BookmarkAuction.json'; // Renamed from BookmarkAuction
  
  // Re-export the contract service functions
  export { 
    formatBigInt, 
    parseToBigInt, 
    contractEvents,
    contractService
  };
  
  // Helper function to clear contract call cache
  export function clearContractCallCache(methodPattern?: string): void {
    contractService.clearCache(methodPattern);
  }
  
  // Cached contract call function
  export async function cachedContractCall<T>(
    contract: any,
    method: string,
    args: any[] = [],
    fallbackValue?: T
  ): Promise<T> {
    return contractService.callContract(contract, method, args, fallbackValue);
  }
  
  // Safe contract call function
  export async function safeContractCall<T>(
    contract: any,
    method: string,
    args: any[] = [],
    fallbackValue: T
  ): Promise<T> {
    return contractService.callContract(contract, method, args, fallbackValue);
  }
  
  // Hook to use the NSI Token contract (ERC20)
  export function useNSIToken() {
    return contractService.getContract(CONTRACT_ADDRESSES.NSI_TOKEN, [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ]);
  }
  
  // Hook to use the CardCatalog contract
  export function useCardCatalog() {
    return contractService.getContract(CONTRACT_ADDRESSES.CARD_CATALOG, CardCatalogABI);
  }
  
  // Hook to use the EvermarkNFT contract
  export function useEvermarkNFT() {
    return contractService.getContract(CONTRACT_ADDRESSES.EVERMARK_NFT, EvermarkNFTABI);
  }
  
  // Hook to use the EvermarkVoting contract
  export function useEvermarkVoting() {
    return contractService.getContract(CONTRACT_ADDRESSES.EVERMARK_VOTING, EvermarkVotingABI);
  }
  
  // Hook to use the EvermarkLeaderboard contract
  export function useEvermarkLeaderboard() {
    return contractService.getContract(CONTRACT_ADDRESSES.EVERMARK_LEADERBOARD, EvermarkLeaderboardABI);
  }
  
  // Hook to use the EvermarkRewards contract
  export function useEvermarkRewards() {
    return contractService.getContract(CONTRACT_ADDRESSES.EVERMARK_REWARDS, EvermarkRewardsABI);
  }
  
  // Hook to use the EvermarkAuction contract
  export function useEvermarkAuction() {
    return contractService.getContract(CONTRACT_ADDRESSES.EVERMARK_AUCTION, EvermarkAuctionABI);
  }
  
  // Convenience hook to get all contracts
  export function useAllContracts() {
    const nsiToken = useNSIToken();
    const cardCatalog = useCardCatalog();
    const evermarkNFT = useEvermarkNFT();
    const evermarkVoting = useEvermarkVoting();
    const evermarkLeaderboard = useEvermarkLeaderboard();
    const evermarkRewards = useEvermarkRewards();
    const evermarkAuction = useEvermarkAuction();
  
    return {
      nsiToken,
      cardCatalog,
      evermarkNFT,
      evermarkVoting,
      evermarkLeaderboard,
      evermarkRewards,
      evermarkAuction,
    };
  }
  
  // Hook to safely get balances from CardCatalog with better error handling
  export function useSafeCardCatalogBalances() {
    // Use our new useBalances hook
    const { nsiBalance, wNsiBalance, votingPower, isLoading, error, fetchBalances } = useBalances();
    
    return {
      wNsiBalance,
      votingPower,
      isLoading,
      error,
      fetchBalances
    };
  }