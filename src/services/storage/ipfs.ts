// src/services/storage/ipfs.ts - Browser-only version
import { IPFS_CONFIG } from '../../config/constants';

class IPFSService {
  // Upload JSON data to IPFS via backend API
  async uploadJSON(data: any, name?: string): Promise<string> {
  try {
    console.log("Attempting to upload JSON to IPFS:", { dataSize: JSON.stringify(data).length, name });
    
    // Add debugging information
    const response = await fetch('/.netlify/functions/ipfs-upload', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'json',
        data,
        name
      }),
    });
    
    // Improved error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error('IPFS Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.hash) {
      console.error('IPFS Upload missing hash in response:', result);
      throw new Error('IPFS upload completed but no hash was returned');
    }
    
    console.log("Successfully uploaded to IPFS:", result.hash);
    return `ipfs://${result.hash}`;
  } catch (error: any) {
    console.error('Failed to upload to IPFS:', error);
    // Fallback mechanism - for development, we can just use a mock IPFS URI
    if (process.env.NODE_ENV === 'development') {
      const mockHash = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      console.warn('Using mock IPFS hash for development:', mockHash);
      return `ipfs://${mockHash}`;
    }
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}
  
  // Upload file to IPFS via backend API
  async uploadFile(file: File, name?: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (name) {
        formData.append('name', name);
      }
      
      const response = await fetch('/.netlify/functions/ipfs-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      return `ipfs://${result.hash}`;
    } catch (error: any) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }
  
  // Fetch data from IPFS using fetch API (browser-compatible)
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
  
  // Check if IPFS is available (always true in browser)
  isAvailable(): boolean {
    return true;
  }
  
  // Get IPFS gateway URL for a hash
  getGatewayUrl(ipfsUri: string): string {
    const hash = this.extractHash(ipfsUri);
    return `${IPFS_CONFIG.GATEWAY_URL}/ipfs/${hash}`;
  }
}

export const ipfsService = new IPFSService();