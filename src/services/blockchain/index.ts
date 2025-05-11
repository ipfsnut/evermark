export { contractService, formatEther, parseEther } from './contracts';
export { eventListener } from './events';

// src/services/storage/ipfs.ts
import PinataClient from '@pinata/sdk';
import { IPFS_CONFIG } from '../../config/constants';

class IPFSService {
  private pinata: PinataClient;
  
  constructor() {
    this.pinata = new PinataClient(
      IPFS_CONFIG.PINATA_API_KEY,
      IPFS_CONFIG.PINATA_SECRET_KEY
    );
  }
  
  // Upload JSON data to IPFS
  async uploadJSON(data: any, name?: string): Promise<string> {
    try {
      const options = name ? {
        pinataMetadata: {
          name,
        },
      } : {};
      
      const result = await this.pinata.pinJSONToIPFS(data, options);
      return `ipfs://${result.IpfsHash}`;
    } catch (error: any) {
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }
  
  // Upload file to IPFS
  async uploadFile(file: File, name?: string): Promise<string> {
    try {
      // Convert File to a format Pinata can use
      const stream = file.stream();
      
      const options = {
        pinataMetadata: name ? { name } : {},
      };
      
      const result = await this.pinata.pinFileToIPFS(stream, options);
      return `ipfs://${result.IpfsHash}`;
    } catch (error: any) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }
  
  // Fetch data from IPFS
  async fetchJSON<T = any>(ipfsUri: string): Promise<T> {
    try {
      const hash = this.extractHash(ipfsUri);
      const url = `${IPFS_CONFIG.GATEWAY_URL}/ipfs/${hash}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error: any) {
      throw new Error(`Failed to fetch from IPFS: ${error.message}`);
    }
  }
  
  // Helper to extract hash from IPFS URI
  private extractHash(ipfsUri: string): string {
    if (ipfsUri.startsWith('ipfs://')) {
      return ipfsUri.slice(7);
    }
    return ipfsUri;
  }
}

export const ipfsService = new IPFSService();