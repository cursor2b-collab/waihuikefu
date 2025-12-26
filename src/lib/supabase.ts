import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zjodvwgmwwgixwpyuvos.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqb2R2d2dtd3dnaXh3cHl1dm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzI2MTcsImV4cCI6MjA4MjMwODYxN30.8MtKA1siDQ7opsqN9uhPsq9ui_tYsfEQexvIqBjkNoc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 类型定义
export interface Conversation {
  id: string;
  user_id: string | null;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'customer' | 'agent' | 'system';
  content: string;
  created_at: string;
}

