// Supabase database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      evermarks: {
        Row: {
          id: string
          title: string
          author: string
          description: string | null
          user_id: string
          verified: boolean
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          author: string
          description?: string | null
          user_id: string
          verified?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          author?: string
          description?: string | null
          user_id?: string
          verified?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          read: boolean
          created_at: string
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          read?: boolean
          created_at?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          read?: boolean
          created_at?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
      stakes: {
        Row: {
          id: string
          user_id: string
          evermark_id: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          evermark_id: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          evermark_id?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      sync_status: {
        Row: {
          id: number
          last_block: number
          updated_at: string
        }
        Insert: {
          id?: number
          last_block?: number
          updated_at?: string
        }
        Update: {
          id?: number
          last_block?: number
          updated_at?: string
        }
      }
      token_balances: {
        Row: {
          id: string
          user_id: string
          amount: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          updated_at?: string
        }
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "credit" | "debit"
          reason: string
          created_at: string
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: "credit" | "debit"
          reason: string
          created_at?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: "credit" | "debit"
          reason?: string
          created_at?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
      }
      users: {
        Row: {
          id: string
          wallet_address: string
          fid: number | null
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          fid?: number | null
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          fid?: number | null
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for cleaner usage
export type DbEvermark = Database['public']['Tables']['evermarks']['Row']
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbSession = Database['public']['Tables']['sessions']['Row']
export type DbStake = Database['public']['Tables']['stakes']['Row']
export type DbTokenBalance = Database['public']['Tables']['token_balances']['Row']
export type DbNotification = Database['public']['Tables']['notifications']['Row']
export type DbSyncStatus = Database['public']['Tables']['sync_status']['Row']