import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nsahnxlrievpquybovya.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYWhueGxyaWV2cHF1eWJvdnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwODQ0OTIsImV4cCI6MjA1MzY2MDQ5Mn0.2yYgeauXcdhJkjt0NFvtx2S3F8NU6WyaCpZqIAQI9vY";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);