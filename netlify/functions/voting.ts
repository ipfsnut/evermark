import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { ethers, Contract } from 'ethers';
import { Database } from '../../src/types/database.types';
import { CONTRACT_ADDRESSES } from '../../src/config/constants';

// Import ABIs
import BookmarkVotingABI from '../../src/config/abis/BookmarkVoting.json';
import CardCatalogABI from '../../src/config/abis/CardCatalog.json';

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
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
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // Get contracts
    const votingContract = new Contract(CONTRACT_ADDRESSES.BOOKMARK_VOTING, BookmarkVotingABI, provider);
    const catalogContract = new Contract(CONTRACT_ADDRESSES.CARD_CATALOG, CardCatalogABI, provider);
    
    // Handle GET requests
    if (event.httpMethod === 'GET') {
      const evermarkId = event.queryStringParameters?.evermarkId;
      const userAddress = event.queryStringParameters?.userAddress;
      
      if (evermarkId && userAddress) {
        // Get voting stats for a specific evermark and user
        const [bookmarkVotes, userVotes, availableVotingPower] = await Promise.all([
          votingContract.getBookmarkVotes(evermarkId),
          votingContract.getUserVotesForBookmark(userAddress, evermarkId),
          catalogContract.getAvailableVotingPower(userAddress),
        ]);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            totalVotes: ethers.formatEther(bookmarkVotes),
            userVotes: ethers.formatEther(userVotes),
            availableVotingPower: ethers.formatEther(availableVotingPower),
          }),
        };
      } else if (evermarkId) {
        // Get total voting stats for an evermark
        const totalVotes = await votingContract.getBookmarkVotes(evermarkId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            totalVotes: ethers.formatEther(totalVotes),
          }),
        };
      } else {
        // Get current voting cycle info
        const [currentCycle, cycleStartTime, timeRemaining] = await Promise.all([
          votingContract.getCurrentCycle(),
          votingContract.cycleStartTime(),
          votingContract.getTimeRemainingInCurrentCycle(),
        ]);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            currentCycle: currentCycle.toString(),
            cycleStartTime: new Date(Number(cycleStartTime) * 1000).toISOString(),
            timeRemaining: Number(timeRemaining),
          }),
        };
      }
    }
    
    // For POST requests, we need authentication
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }
    
    // Decode token to get user ID
    const tokenParts = Buffer.from(token, 'base64').toString().split(':');
    const userId = tokenParts[0];
    
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
    
    // Get user's wallet address
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    const walletAddress = user.wallet_address;
    
    // Handle POST request for vote delegation/undelegation
    if (event.httpMethod === 'POST') {
      const { action, evermarkId, amount } = JSON.parse(event.body || '{}');
      
      if (!action || !evermarkId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }
      
      try {
        let result;
        
        if (action === 'delegate') {
          if (!amount) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Amount required for delegation' })
            };
          }
          
          // Check if user has enough voting power
          const availableVotingPower = await catalogContract.getAvailableVotingPower(walletAddress);
          const amountWei = ethers.parseEther(amount);
          
          if (availableVotingPower < amountWei) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Insufficient voting power' })
            };
          }
          
          // Return transaction data for frontend to execute
          // Frontend will use wallet to sign and send
          result = {
            action: 'delegate',
            evermarkId,
            amount,
            amountWei: amountWei.toString(),
            contractAddress: CONTRACT_ADDRESSES.BOOKMARK_VOTING,
            // Frontend will call: delegateVotes(evermarkId, amountWei)
          };
        } else if (action === 'undelegate') {
          if (!amount) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Amount required for undelegation' })
            };
          }
          
          // Check if user has delegated votes to undelegate
          const userVotes = await votingContract.getUserVotesForBookmark(walletAddress, evermarkId);
          const amountWei = ethers.parseEther(amount);
          
          if (userVotes < amountWei) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Insufficient delegated votes' })
            };
          }
          
          // Return transaction data for frontend to execute
          result = {
            action: 'undelegate',
            evermarkId,
            amount,
            amountWei: amountWei.toString(),
            contractAddress: CONTRACT_ADDRESSES.BOOKMARK_VOTING,
            // Frontend will call: undelegateVotes(evermarkId, amountWei)
          };
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
          };
        }
        
        // Update local cache optimistically
        // This will be verified/corrected by blockchain sync
        await supabase
          .from('stakes')
          .upsert([{
            user_id: userId,
            evermark_id: evermarkId,
            amount: parseFloat(amount),
          }], {
            onConflict: 'user_id,evermark_id'
          });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } catch (error) {
        console.error('Voting operation error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Operation failed' })
        };
      }
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Voting function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };