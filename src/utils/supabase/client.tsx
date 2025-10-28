import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client instance
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
