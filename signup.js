// signup.js
import { supabase } from './supabaseClient.js';

export async function signUp(email, password, referredBy = null) {
  // 1️⃣ Create the Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  if (authError) throw new Error('Auth error: ' + authError.message);

  // 2️⃣ Generate referral code (first 8 chars of UUID)
  const userId = authData.user.id;
  const referralCode = userId.substring(0, 8);

  // 3️⃣ Insert into 'users' table
  const { error: dbError } = await supabase
    .from('users')
    .insert([{
      id: userId,
      username: email,
      password,          // for demo only; use hashing in production
      referral_code: referralCode,
      referred_by: referredBy
    }]);
  if (dbError) throw new Error('DB error: ' + dbError.message);

  return { userId, referralCode };
}
