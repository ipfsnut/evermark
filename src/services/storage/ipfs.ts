import PinataClient from '@pinata/sdk';
import { IPFS_CONFIG } from '../../config/constants';

class IPFSService {
  private pinata: PinataClient | null = null;
  
  constructor() {
    try {
      if (IPFS_CONFIG.PINATA_API_KEY && IPFS_CONFIG.PINATA_SECRET_KEY) {
        this.pinata = new PinataClient(
          IPFS_CONFIG.PINATA_API_KEY,
          IPFS_CONFIG.PINATA_SECRET_KEY
        );
      } else {
        console.warn('IPFS: Missing Pinata credentials, service will be disabled');
      }
    } catch (error) {
      console.error('IPFS: Failed to initialize Pinata client:', error);
    }
  }
  
  // Upload JSON data to IPFS
  async uploadJSON(data: any, name?: string): Promise<string> {
    if (!this.pinata) {
      throw new Error('IPFS service not initialized');
    }
    
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
    if (!this.pinata) {
      throw new Error('IPFS service not initialized');
    }
    
    try {
      // Convert File to a format Pinata can use
      const buffer = await file.arrayBuffer();
      
      const options = {
        pinataMetadata: name ? { name } : undefined,
        pinataOptions: {
          cidVersion: 1 as const,
        },
      };
      
      const result = await this.pinata.pinFileToIPFS(Buffer.from(buffer), options);
      return `ipfs://${result.IpfsHash}`;
    } catch (error: any) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }
  
  // Fetch data from IPFS using fetch API
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
  
  // Check if IPFS is available
  isAvailable(): boolean {
    return this.pinata !== null;
  }
  
  // Get IPFS gateway URL for a hash
  getGatewayUrl(ipfsUri: string): string {
    const hash = this.extractHash(ipfsUri);
    return `${IPFS_CONFIG.GATEWAY_URL}/ipfs/${hash}`;
  }
}

export const ipfsService = new IPFSService();