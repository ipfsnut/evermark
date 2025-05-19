// netlify/services/ipfs.service.ts

class IPFSService {
  private gateway: string;

  constructor() {
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
  }

  // Upload JSON data to IPFS via our Netlify function
  async uploadJSON<T>(data: T, name: string): Promise<string> {
    try {
      // For server-side, we need the full URL including the domain
      const url = process.env.URL 
        ? `${process.env.URL}/.netlify/functions/ipfs-upload`
        : '/.netlify/functions/ipfs-upload';

      const fetch = require('node-fetch');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'json',
          data,
          name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return `ipfs://${result.hash}`;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS');
    }
  }

  // Fetch JSON data from IPFS
  async fetchJSON<T>(ipfsUri: string): Promise<T> {
    try {
      const hash = ipfsUri.startsWith('ipfs://') ? ipfsUri.slice(7) : ipfsUri;
      const url = `${this.gateway}${hash}`;
      
      const fetch = require('node-fetch');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`IPFS fetch failed with status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('IPFS fetch error:', error);
      throw new Error('Failed to fetch from IPFS');
    }
  }

  // Get a publicly accessible URL for an IPFS hash
  getPublicUrl(ipfsUri: string): string {
    const hash = ipfsUri.startsWith('ipfs://') ? ipfsUri.slice(7) : ipfsUri;
    return `${this.gateway}${hash}`;
  }
}

export const ipfsService = new IPFSService();