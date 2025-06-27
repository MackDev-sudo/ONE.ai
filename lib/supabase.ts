import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

const REALTIME_CONFIG = {
  eventsPerSecond: 2,
  retryAfterMs: 2500,
  retryIntervalMs: 1000,
  maxRetries: 3
};

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: 'oneai_auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: REALTIME_CONFIG
      }
    })
  }
  return supabaseInstance;
}

// Clean up connections when the window is closed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (supabaseInstance) {
      supabaseInstance.removeAllChannels();
    }
  });
}

export const supabase = createClient();
