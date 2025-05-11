import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from './constants';

export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY
);