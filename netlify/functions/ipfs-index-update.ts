// netlify/functions/ipfs-index-update.ts

import { Handler } from '@netlify/functions';
import { weeklyIndexService } from '../services/weekly-index.service';
import { EvermarkIndexItem } from '../types/ipfs.types';

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the evermark data
    const evermarkData = JSON.parse(event.body || '{}');
    
    if (!evermarkData.id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Evermark ID is required' })
      };
    }
    
    // Convert to index item format
    const indexItem: EvermarkIndexItem = {
      id: evermarkData.id,
      title: evermarkData.title || 'Untitled',
      author: evermarkData.author || 'Unknown',
      description: evermarkData.description || '',
      contentType: evermarkData.metadata?.type || 'website',
      metadataURI: evermarkData.metadata?.external_url || '',
      tags: Array.isArray(evermarkData.metadata?.tags) ? evermarkData.metadata.tags : [],
      createdAt: evermarkData.createdAt ? new Date(evermarkData.createdAt).getTime() : Date.now(),
      votes: typeof evermarkData.metadata?.voteCount === 'number' ? evermarkData.metadata.voteCount : 0,
      owner: evermarkData.userId || ''
    };
    
    // Get current cycle
    const cycleId = await weeklyIndexService.getCurrentCycleId();
    
    // Update weekly index
    const hash = await weeklyIndexService.addToWeeklyIndex(cycleId, indexItem);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Index updated successfully',
        cycleId,
        indexHash: hash
      })
    };
  } catch (unknownError) {
    // Properly handle unknown error type
    const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
    
    console.error('Error updating index:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to update index',
        message: error.message
      })
    };
  }
};

export { handler };