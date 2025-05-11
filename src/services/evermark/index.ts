export { createEvermark } from './create';
export { fetchEvermark } from './fetch';

// Combined evermark service
export const evermarkService = {
  create: createEvermark,
  fetch: fetchEvermark,
  
  // Other methods can be added here
  async list(userAddress?: string) {
    if (userAddress) {
      const tokenIds = await contractService.getUserEvermarks(userAddress);
      return Promise.all(tokenIds.map(fetchEvermark));
    }
    
    // Logic for listing all evermarks
    return [];
  },
};