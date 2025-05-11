// src/services/evermark/create.ts
import { CreateEvermarkInput, Evermark } from '../../types/evermark.types';
import { contractService } from '../blockchain/contracts';
import { ipfsService } from '../storage/ipfs';
import { databaseService } from '../storage/database';
import { translationService } from '../blockchain/translation';
import { authService } from '../auth.service';
import { ethers } from 'ethers';

// Import BookmarkNFT ABI for event parsing
import BookmarkNFTABI from '../../config/abis/BookmarkNFT.json';

export const createEvermark = async (input: CreateEvermarkInput): Promise<Evermark> => {
  try {
    // 1. Get current user
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }
    
    const address = await window.ethereum.request({ method: 'eth_accounts' });
    if (!address || !address[0]) {
      throw new Error('No wallet connected');
    }
    
    // Get user ID from session
    const token = authService.getSessionToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const { valid, userId } = await authService.validateSession(token);
    if (!valid || !userId) {
      throw new Error('Invalid session');
    }
    
    // 2. Prepare metadata and contract data
    const { contractData, fullMetadata } = translationService.prepareContractMetadata({
      ...input.manualData,
      contentType: input.contentType,
      sourceUrl: input.sourceUrl,
    });
    
    // 3. Upload metadata to IPFS
    let metadataUri = '';
    if (ipfsService.isAvailable()) {
      metadataUri = await ipfsService.uploadJSON(fullMetadata, `evermark-${Date.now()}`);
    } else {
      console.warn('IPFS not available, skipping metadata upload');
      // You could implement a fallback here (like storing in Supabase)
      metadataUri = 'ipfs://placeholder'; // Placeholder for now
    }
    
    // 4. Update contract data with metadata URI
    contractData.metadataURI = metadataUri;
    
    // 5. Mint NFT on blockchain (using BookmarkNFT as EvermarkNFT)
    const { hash, wait } = await contractService.mintEvermark(
      address[0],
      metadataUri,
      contractData.title,
      contractData.contentCreator
    );
    
    // 6. Wait for transaction to complete
    const receipt = await wait();
    
    // 7. Extract token ID from receipt
    let tokenId = '';
    if (receipt && receipt.logs) {
      // Parse the BookmarkCreated event to get the token ID
      const iface = new ethers.Interface(BookmarkNFTABI);
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          
          // Look for BookmarkCreated event
          if (parsedLog && parsedLog.name === 'BookmarkCreated') {
            tokenId = parsedLog.args[0].toString(); // tokenId is the first argument
            break;
          }
          
          // Also check for Transfer event as a fallback
          if (!tokenId && parsedLog && parsedLog.name === 'Transfer') {
            tokenId = parsedLog.args[2].toString(); // tokenId is the third argument
          }
        } catch (e) {
          // Log might not be from our contract, continue
          continue;
        }
      }
    }
    
    // Fallback if we couldn't extract tokenId
    if (!tokenId) {
      console.warn('Could not extract tokenId from receipt, using timestamp fallback');
      tokenId = Date.now().toString();
    }
    
    // 8. Prepare Evermark data for database
    const evermarkData = {
      title: contractData.title,
      author: contractData.contentCreator,
      description: fullMetadata.description || null,
      userId: userId,
      verified: false, // Could implement verification logic
      metadata: {
        ...fullMetadata,
        tokenId: tokenId,
        metadataUri: metadataUri,
        owner: address[0],
        transactionHash: hash,
      },
    };
    
    // 9. Save to database (optional - graceful failure)
    let savedEvermark: Evermark | null = null;
    try {
      savedEvermark = await databaseService.saveEvermark(evermarkData);
    } catch (dbError) {
      console.error('Failed to save to database:', dbError);
      // Don't fail the entire operation if database save fails
      // The NFT has been minted, which is the source of truth
    }
    
    // 10. Return the evermark
    if (savedEvermark) {
      return {
        ...savedEvermark,
        metadata: {
          ...savedEvermark.metadata,
          transactionHash: hash,
        },
      };
    }
    
    // Fallback: create minimal evermark object if database failed
    return {
      id: tokenId || Date.now().toString(),
      title: evermarkData.title,
      author: evermarkData.author,
      description: evermarkData.description,
      userId: evermarkData.userId,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: evermarkData.metadata as any,
    };
    
  } catch (error: any) {
    console.error('Create evermark failed:', error);
    throw new Error(`Failed to create evermark: ${error.message}`);
  }
};