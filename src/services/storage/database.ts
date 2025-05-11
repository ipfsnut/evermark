import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '../../config/constants';
import { Evermark, EvermarkMetadata } from '../../types';
import { Database, DbEvermark } from '../../types/database.types';

export const supabase = createClient<Database>(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY
);

class DatabaseService {
  // Transform database evermark to app evermark
  private transformDbEvermark(dbEvermark: DbEvermark): Evermark {
    return {
      id: dbEvermark.id,
      title: dbEvermark.title,
      author: dbEvermark.author,
      description: dbEvermark.description,
      userId: dbEvermark.user_id,
      verified: dbEvermark.verified,
      createdAt: new Date(dbEvermark.created_at),
      updatedAt: new Date(dbEvermark.updated_at),
      metadata: dbEvermark.metadata as EvermarkMetadata,
    };
  }

  // Evermark-related database operations
  async saveEvermark(evermark: Partial<Evermark> & { userId: string; metadata: EvermarkMetadata }): Promise<Evermark> {
    try {
      const { data, error } = await supabase
        .from('evermarks')
        .insert([{
          title: evermark.title || 'Untitled',
          author: evermark.author || 'Unknown',
          description: evermark.description || null,
          user_id: evermark.userId,
          verified: evermark.verified || false,
          metadata: evermark.metadata,
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
  
  async getEvermarksByUserId(userId: string): Promise<Evermark[]> {
    try {
      const { data, error } = await supabase
        .from('evermarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(this.transformDbEvermark);
    } catch (error: any) {
      throw new Error(`Failed to get user evermarks: ${error.message}`);
    }
  }
  
  async getAllEvermarks(limit = 50, offset = 0): Promise<Evermark[]> {
    try {
      const { data, error } = await supabase
        .from('evermarks')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      return data.map(this.transformDbEvermark);
    } catch (error: any) {
      throw new Error(`Failed to get evermarks: ${error.message}`);
    }
  }
  
  async updateEvermark(id: string, updates: Partial<Evermark>): Promise<Evermark | null> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.author !== undefined) updateData.author = updates.author;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.verified !== undefined) updateData.verified = updates.verified;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('evermarks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return this.transformDbEvermark(data);
    } catch (error: any) {
      throw new Error(`Failed to update evermark: ${error.message}`);
    }
  }
}

export const databaseService = new DatabaseService();