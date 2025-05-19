import { Handler, HandlerResponse } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Store keys
const LATEST_POINTER_KEY = 'latest';
const HISTORY_PREFIX = 'history-';

// Local in-memory store for development
const localStore = {
  data: new Map<string, string>(),
  get: async (key: string) => localStore.data.get(key) || null,
  set: async (key: string, value: string) => {
    localStore.data.set(key, value);
    return value;
  }
};

const handler: Handler = async (event): Promise<HandlerResponse> => {
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

  // Get the store - use Netlify Blobs or fallback to local store
  let store;
  try {
    store = getStore('ipfs-index-pointers');
  } catch (error) {
    console.warn('Netlify Blobs not configured, using local in-memory store');
    store = localStore;
  }

  // GET: Retrieve the latest index pointer
  if (event.httpMethod === 'GET') {
    try {
      // Get the latest pointer
      const latestPointerStr = await store.get(LATEST_POINTER_KEY);
      
      if (!latestPointerStr) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'No index pointer found',
            message: 'The index hasn\'t been created yet'
          })
        };
      }
      
      // Parse the stored JSON string
      const latestPointer = JSON.parse(latestPointerStr);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          indexHash: latestPointer.indexHash,
          cycleId: latestPointer.cycleId,
          updatedAt: latestPointer.updatedAt
        })
      };
    } catch (error) {
      console.error('Error retrieving latest pointer:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to retrieve latest pointer' })
      };
    }
  }
  
  // POST: Update the index pointer
  if (event.httpMethod === 'POST') {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }
    
    try {
      const { indexHash, cycleId } = JSON.parse(event.body);
      
      if (!indexHash) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'indexHash is required' })
        };
      }
      
      // Create a pointer object
      const pointer = {
        indexHash,
        cycleId: cycleId || 'unknown',
        updatedAt: new Date().toISOString()
      };
      
      // Save the latest pointer
      await store.set(LATEST_POINTER_KEY, JSON.stringify(pointer));
      
      // Also save to history with timestamp
      const timestamp = Date.now();
      await store.set(
        `${HISTORY_PREFIX}${cycleId || 'unknown'}-${timestamp}`, 
        JSON.stringify({
          ...pointer,
          createdAt: new Date().toISOString()
        })
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          indexHash,
          message: 'Index pointer updated successfully'
        })
      };
    } catch (error) {
      console.error('Error updating pointer:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to update index pointer',
          details: error.message
        })
      };
    }
  }
  
  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

export { handler };
