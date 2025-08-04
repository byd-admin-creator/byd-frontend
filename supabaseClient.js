// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aksejmeyvztesoxxhikt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrc2VqbWV5dnp0ZXNveHhoaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NjE1NTcsImV4cCI6MjA2NTIzNzU1N30.ErFAVub2zxirogA5Z3hlpvVcCG5dtq4QQijD45Zzbng';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
