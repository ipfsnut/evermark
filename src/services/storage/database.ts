import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '../../config/constants';
import { Evermark, User } from '../../types';

export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY
);

class DatabaseService {
  // Evermark-related database operations
  async saveEvermark(evermark: Partial<Evermark> & { tokenId: string }): Promise<Evermark> {
    try {
      const { data, error } = await supabase
        .from('evermarks')
        .insert([{
          token_id: evermark.tokenId,
          metadata_uri: evermark.metadataUri,
          owner: evermark.owner,
          metadata: evermark.metadata,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return this.transformDbEvermark(data);
    } catch (error: any) {
      throw new Error(`Failed to save evermark: ${error.message}`);
    }
  }
  
  async getEvermark(id: string): Promise<Evermark | null> {
    try {
      const { data, error } = await supabase
        .from('evermarks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      return this.transformDbEvermark(data);
    } catch (error: any) {
      throw new Error(`Failed to get evermark: ${error.message}`);
    }
  }
  
  async getEvermarkByTokenId(tokenId: string): Promise<Evermark | null> {
    try {
      const { data, error } = await supabase
        .from('evermarks')
        .select('*')
        .eq('token_id', tokenId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return this.transformDbEvermark(data);
    } catch (error: any) {
      throw new Error(`Failed to get evermark by token ID: ${error.message}`);
    }
  }
  
  // Transform database record to Evermark object
  private transformDbEvermark(dbRecord: any): Evermark {
    return {
      id: dbRecord.id,
      tokenId: dbRecord.token_id,
      metadataUri: dbRecord.metadata_uri,
      owner: dbRecord.owner,
      metadata: dbRecord.metadata,
      createdAt: new Date(dbRecord.created_at),
      updatedAt: dbRecord.updated_at ? new Date(dbRecord.updated_at) : undefined,
    };
  }
}

export const databaseService = new DatabaseService();