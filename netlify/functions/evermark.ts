import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/types/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in evermarks function');
}

const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: { persistSession: false },
  }
);

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    console.log('Function environment:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey,
      nodeEnv: process.env.NODE_ENV
    });
    
    // For development, use mock data if Supabase is not configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Using mock data for evermarks function');
      
      if (event.httpMethod === 'GET') {
        const evermarkId = event.queryStringParameters?.id;
        
        if (evermarkId) {
          // Return a single mock evermark
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              evermark: {
                id: evermarkId,
                title: 'Sample Evermark',
                author: 'Unknown Author',
                description: 'A sample evermark for testing.',
                userId: 'dev-user-123',
                verified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                  type: 'website',
                  external_url: 'https://example.com',
                  tokenId: evermarkId,
                }
              }
            })
          };
        }
        
        // Return mock evermarks list
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            evermarks: [
              {
                id: 'mock-1',
                title: 'Sample Evermark 1',
                author: 'Author One',
                description: 'First sample evermark.',
                userId: 'dev-user-123',
                verified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                  type: 'website',
                  external_url: 'https://example1.com',
                  tokenId: 'mock-1',
                }
              }
            ]
          })
        };
      }
    }
    
    // Handle GET requests - public access for fetching
    if (event.httpMethod === 'GET') {
      const evermarkId = event.queryStringParameters?.id;
      const userOnly = event.queryStringParameters?.userOnly === 'true';
      const limit = parseInt(event.queryStringParameters?.limit || '50');
      
      // If requesting user-specific evermarks, we need authentication
      if (userOnly) {
        const authHeader = event.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Authentication required for user-specific evermarks' })
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
        
        // Fetch user-specific evermarks
        let query = supabase
          .from('evermarks')
          .select('*')
          .eq('user_id', userId);
        
        // Apply sorting and limit
        query = query.order('created_at', { ascending: false }).limit(limit);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching user evermarks:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error fetching evermarks' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ evermarks: data || [] })
        };
      }
      
      // If fetching a specific evermark by ID
      if (evermarkId) {
        const { data, error } = await supabase
          .from('evermarks')
          .select('*')
          .eq('id', evermarkId)
          .single();
          
        if (error) {
          console.error('Error fetching evermark by ID:', error);
          if (error.code === 'PGRST116') {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Evermark not found' })
            };
          }
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error fetching evermark' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ evermark: data })
        };
      }
      
      // If fetching all evermarks (public access)
      let query = supabase
        .from('evermarks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching all evermarks:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error fetching evermarks' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ evermarks: data || [] })
      };
    }
    
    // For non-GET requests, we use blockchain as the source of truth
    // These functions just update our cache/database
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

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'POST': {
        // This should only be called after blockchain minting
        // It updates our database cache
        const evermarkData = JSON.parse(event.body || '{}');
        
        // Validate required fields
        if (!evermarkData.title || !evermarkData.metadata?.tokenId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing required fields' })
          };
        }
        
        // Prepare evermark data for database
        const newEvermark = {
          title: evermarkData.title,
          author: evermarkData.author || 'Unknown',
          description: evermarkData.description || null,
          user_id: userId,
          verified: evermarkData.verified || false,
          metadata: evermarkData.metadata,
        };
        
        const { data, error } = await supabase
          .from('evermarks')
          .insert([newEvermark])
          .select()
          .single();

        if (error) {
          console.error('Error caching evermark:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error caching evermark' })
          };
        }
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
        };
      }

      case 'PUT': {
        // Update evermark metadata in cache
        const evermarkId = event.queryStringParameters?.id;
        
        if (!evermarkId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Evermark ID is required' })
          };
        }
        
        // Verify ownership
        const { data: existingEvermark, error: fetchError } = await supabase
          .from('evermarks')
          .select('user_id')
          .eq('id', evermarkId)
          .single();
        
        if (fetchError || !existingEvermark) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Evermark not found' })
          };
        }
        
        if (existingEvermark.user_id !== userId) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'You do not have permission to update this evermark' })
          };
        }
        
        // Get update data
        const updateData = JSON.parse(event.body || '{}');
        
        // Filter to allowed fields (metadata updates only)
        const allowedFields = ['description', 'metadata'];
        const filteredUpdate = Object.keys(updateData)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
          }, {});
        
        filteredUpdate['updated_at'] = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('evermarks')
          .update(filteredUpdate)
          .eq('id', evermarkId)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating evermark:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error updating evermark' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Evermarks function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };