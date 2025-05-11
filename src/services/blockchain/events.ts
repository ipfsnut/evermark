import { EventEmitter } from 'events';
import { contractService } from './contracts';
import { CONTRACT_ADDRESSES } from '../../config/constants';

class EventListener {
  private emitter: EventEmitter;
  private listeners: Map<string, any> = new Map();
  
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }
  
  // Start listening to blockchain events
  async startListening() {
    // Set up listeners for Evermark NFT events
    const evermarkContract = contractService['getContract'](
      CONTRACT_ADDRESSES.EVERMARK_NFT,
      [
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
        "event Mint(address indexed to, uint256 indexed tokenId, string uri)"
      ]
    );
    
    // Transfer event
    const transferHandler = (from: string, to: string, tokenId: bigint) => {
      this.emitter.emit('evermark:transfer', { from, to, tokenId: tokenId.toString() });
      // Clear relevant cache
      contractService.clearCache('tokensOfOwner');
    };
    
    evermarkContract.on('Transfer', transferHandler);
    this.listeners.set('Transfer', transferHandler);
    
    // Mint event (if your contract has one)
    const mintHandler = (to: string, tokenId: bigint, uri: string) => {
      this.emitter.emit('evermark:mint', { to, tokenId: tokenId.toString(), uri });
      // Clear relevant cache
      contractService.clearCache('tokensOfOwner');
    };
    
    // Only add if the event exists in your contract
    evermarkContract.on('Mint', mintHandler);
    this.listeners.set('Mint', mintHandler);
  }
  
  // Subscribe to events
  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler);
  }
  
  // Unsubscribe from events
  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler);
  }
  
  // Clean up listeners
  stopListening() {
    // Remove all contract event listeners
    const evermarkContract = contractService['getContract'](
      CONTRACT_ADDRESSES.EVERMARK_NFT,
      []
    );
    
    evermarkContract.removeAllListeners();
    this.listeners.clear();
  }
}

export const eventListener = new EventListener();
