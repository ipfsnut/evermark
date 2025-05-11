import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { ethers, Contract } from 'ethers';
import { Database } from '../../src/types/database.types';
import { CONTRACT_ADDRESSES } from '../../src/config/constants';

// Import ABIs
import BookmarkNFTABI from '../../src/config/abis/BookmarkNFT.json';
import BookmarkVotingABI from '../../src/config/abis/BookmarkVoting.json';

// Simple IPFS service for fetching metadata
const IPFS_GATEWAY = 'https://gateway.pinata.cloud';

async function fetchFromIPFS(ipfsUri: string): Promise<Record<string, any> | null> {
  try {
    const hash = ipfsUri.startsWith('ipfs://') ? ipfsUri.slice(7) : ipfsUri;
    const url = `${IPFS_GATEWAY}/ipfs/${hash}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return null;
  }
}

const handler: Handler = async (event) => {
  // This function can be triggered manually or by a scheduled job
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check for admin/system authorization
  const authHeader = event.headers.authorization;
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    // Initialize clients
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);
    
    // Initialize blockchain provider
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // Get contracts
    const nftContract = new Contract(CONTRACT_ADDRESSES.BOOKMARK_NFT, BookmarkNFTABI, provider);
    const votingContract = new Contract(CONTRACT_ADDRESSES.BOOKMARK_VOTING, BookmarkVotingABI, provider);
    
    // Get the last synced block from database
    const { data: syncStatus } = await supabase
      .from('sync_status')
      .select('last_block')
      .eq('id', 1)
      .single();
    
    const lastBlock = syncStatus?.last_block || 0;
    const currentBlock = await provider.getBlockNumber();
    
    console.log(`Syncing from block ${lastBlock} to ${currentBlock}`);
    
    // Skip if no new blocks
    if (currentBlock <= lastBlock) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'No new blocks to sync',
          lastBlock,
          currentBlock,
        }),
      };
    }
    
    // Sync Evermark creation events
    const transferFilter = nftContract.filters.Transfer(ethers.ZeroAddress, null, null);
    const transferEvents = await nftContract.queryFilter(transferFilter, lastBlock + 1, currentBlock);
    
    let processedTransfers = 0;
    for (const event of transferEvents) {
      // Type check to ensure we have an EventLog with args
      if (!('args' in event)) continue;
      
      const tokenId = event.args[2].toString();
      const to = event.args[1];
      
      console.log(`Processing new Evermark: ${tokenId}`);
      
      try {
        // Get tokenURI and metadata
        const tokenURI = await nftContract.tokenURI(tokenId);
        const [title, author, metadataURI] = await nftContract.getBookmarkMetadata(tokenId);
        
        // Fetch metadata from IPFS
        let metadata: Record<string, any> | null = null;
        if (metadataURI) {
          metadata = await fetchFromIPFS(metadataURI);
        }
        
        // Find user by wallet address
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', to.toLowerCase())
          .single();
        
        const userId = user?.id || null;
        
        // Insert or update evermark in database
        const evermarkData = {
          id: tokenId,
          title: title || 'Untitled',
          author: author || 'Unknown',
          description: metadata?.description || null,
          user_id: userId,
          verified: false,
          metadata: {
            ...(metadata || {}),
            tokenId,
            metadataUri: metadataURI,
            owner: to,
            type: metadata?.type || 'website',
          },
        };
        
        await supabase
          .from('evermarks')
          .upsert([evermarkData], { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
        
        processedTransfers++;
      } catch (error) {
        console.error(`Error processing Evermark ${tokenId}:`, error);
      }
    }
    
    // Sync vote delegation events
    const voteEvents = await votingContract.queryFilter(
      votingContract.filters.VoteDelegated(),
      lastBlock + 1,
      currentBlock
    );
    
    let processedVotes = 0;
    for (const event of voteEvents) {
      // Type check to ensure we have an EventLog with args
      if (!('args' in event)) continue;
      
      const user = event.args[0];
      const bookmarkId = event.args[1].toString();
      const amount = ethers.formatEther(event.args[2]);
      
      console.log(`Processing vote delegation: ${amount} NSI to Evermark ${bookmarkId}`);
      
      // Find user by wallet address
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', user.toLowerCase())
        .single();
      
      if (userRecord) {
        // Upsert stake record
        await supabase
          .from('stakes')
          .upsert([{
            user_id: userRecord.id,
            evermark_id: bookmarkId,
            amount: parseFloat(amount),
          }], {
            onConflict: 'user_id,evermark_id'
          });
        
        processedVotes++;
      }
    }
    
    // Sync vote undelegation events
    const undelegateEvents = await votingContract.queryFilter(
      votingContract.filters.VoteUndelegated(),
      lastBlock + 1,
      currentBlock
    );
    
    let processedUndelegates = 0;
    for (const event of undelegateEvents) {
      if (!('args' in event)) continue;
      
      const user = event.args[0];
      const bookmarkId = event.args[1].toString();
      const amount = ethers.formatEther(event.args[2]);
      
      console.log(`Processing vote undelegation: ${amount} NSI from Evermark ${bookmarkId}`);
      
      // Find user by wallet address
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', user.toLowerCase())
        .single();
      
      if (userRecord) {
        // Update or delete stake record
        const { data: existingStake } = await supabase
          .from('stakes')
          .select('amount')
          .eq('user_id', userRecord.id)
          .eq('evermark_id', bookmarkId)
          .single();
        
        if (existingStake) {
          const newAmount = existingStake.amount - parseFloat(amount);
          if (newAmount <= 0) {
            // Delete stake if amount becomes 0 or negative
            await supabase
              .from('stakes')
              .delete()
              .eq('user_id', userRecord.id)
              .eq('evermark_id', bookmarkId);
          } else {
            // Update with new amount
            await supabase
              .from('stakes')
              .update({ amount: newAmount })
              .eq('user_id', userRecord.id)
              .eq('evermark_id', bookmarkId);
          }
        }
        
        processedUndelegates++;
      }
    }
    
    // Update sync status
    await supabase
      .from('sync_status')
      .upsert([{
        id: 1,
        last_block: currentBlock,
        updated_at: new Date().toISOString(),
      }]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        syncedBlocks: currentBlock - lastBlock,
        transferEvents: transferEvents.length,
        voteEvents: voteEvents.length,
        undelegateEvents: undelegateEvents.length,
        processedTransfers,
        processedVotes,
        processedUndelegates,
        newLastBlock: currentBlock,
      }),
    };
    
  } catch (error: any) {
    console.error('Blockchain sync error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Sync failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

export { handler };