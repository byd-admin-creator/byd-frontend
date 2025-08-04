// login.js
import { supabase } from './supabaseClient.js';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw new Error('Login error: ' + error.message);
  return data.user;
}
