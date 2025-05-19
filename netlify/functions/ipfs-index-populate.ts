// netlify/functions/ipfs-index-populate.ts

import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/types/database.types';
import { weeklyIndexService } from '../services/weekly-index.service';
import { EvermarkIndexItem } from '../types/ipfs.types';

const handler: Handler = async (event) => {
  // Only allow POST requests with authentication
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing Supabase environment variables' })
    };
  }

  const supabase = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: { persistSession: false },
    }
  );

  try {
    // Get all Evermarks from Supabase
    const { data: evermarks, error } = await supabase
      .from('evermarks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to retrieve Evermarks: ${error.message}`);
    }

    if (!evermarks || evermarks.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'No Evermarks found to index' })
      };
    }

    console.log(`Found ${evermarks.length} Evermarks to index`);

    // Get current cycle ID
    const cycleId = await weeklyIndexService.getCurrentCycleId();
    
    // Process each Evermark
    let successCount = 0;
    let errorCount = 0;

    for (const evermark of evermarks) {
      try {
        // Convert to index item
        const indexItem: EvermarkIndexItem = {
          id: evermark.id,
          title: evermark.title || 'Untitled',
          author: evermark.author || 'Unknown',
          description: evermark.description || '',
          contentType: evermark.metadata?.type || 'website',
          metadataURI: evermark.metadata?.external_url || '',
          tags: Array.isArray(evermark.metadata?.tags) ? evermark.metadata.tags : [],
          createdAt: evermark.created_at ? new Date(evermark.created_at).getTime() : Date.now(),
          votes: typeof evermark.metadata?.voteCount === 'number' ? evermark.metadata.voteCount : 0,
          owner: evermark.user_id || ''
        };

        // Add to index
        await weeklyIndexService.addToWeeklyIndex(cycleId, indexItem);
        successCount++;
      } catch (err) {
        console.error(`Failed to index Evermark ${evermark.id}:`, err);
        errorCount++;
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Indexed ${successCount} Evermarks successfully, ${errorCount} failed`,
        cycleId
      })
    };
  } catch (unknownError) {
    const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
    console.error('Error populating index:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to populate index',
        message: error.message 
      })
    };
  }
};

export { handler };