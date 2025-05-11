import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { Database } from '../../src/types/database.types';
import { v4 as uuidv4 } from 'uuid';

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { walletAddress, signature, message } = JSON.parse(event.body || '{}');

    if (!walletAddress || !signature || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    // For development, use a mock response if environment variables are missing
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase environment variables, using development fallback');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true, 
          userId: 'dev-user-123',
          token: 'dev-token-456'
        }),
      };
    }

    // Create Supabase client with proper headers
    const supabase = createClient<Database>(
      supabaseUrl, 
      supabaseKey,
      {
        auth: { persistSession: false },
      }
    );

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    let userId;

    if (userError) {
      // Only handle "not found" errors here
      if (userError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user:', userError);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Error checking user' }),
        };
      }
      
      // User doesn't exist, create a new one
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          { wallet_address: walletAddress.toLowerCase() }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Error creating user' }),
        };
      }
      
      userId = newUser.id;
    } else {
      userId = user.id;
    }

    // Generate a session token
    const token = uuidv4();
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session in database
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        token: token,
        expires_at: expiresAt.toISOString(),
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Error creating session' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true,
        userId,
        token
      }),
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };