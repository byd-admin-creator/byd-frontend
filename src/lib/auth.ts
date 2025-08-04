import { supabase } from './supabaseClient'

/**
 * Sign up a user and save profile in `users` table with FK-safe creation and referral logging.
 */
export async function signUpProfile(
  email: string,
  password: string,
  referralCodeInput: string | null = null,
  username: string
) {
  // 1️⃣ Check if the username is already taken
const { data: existing, error: checkErr } = await supabase
  .from('users')
  .select('id')
  .eq('username', username)
  .maybeSingle()

if (checkErr) throw checkErr
if (existing) throw new Error('Username already taken. Please choose another.')


  // 2️⃣ Auth signup to create `auth.users` record first
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password,
  })
  if (authErr) throw authErr

  const uid = authData.user?.id
  if (!uid) throw new Error('User ID not returned from auth signup.')

  // 3️⃣ Generate this new user’s referral code
  const myReferralCode = uid.slice(0, 8)

  // 4️⃣ Resolve the incoming referralCodeInput (if any) to a UUID
  let referredById: string | null = null
  if (referralCodeInput) {
    const { data: refUser, error: lookupErr } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCodeInput.trim())
      .single()

    if (lookupErr || !refUser) {
      throw new Error('Invalid referral code provided.')
    }
    referredById = refUser.id
  }

  // 5️⃣ Insert user profile in `users` table
  const { error: insertErr } = await supabase
    .from('users')
    .insert([{
      id: uid,
      username,
      email,
      referral_code: myReferralCode,
      referred_by: referredById,
      created_at: new Date(),
    }])
  if (insertErr) throw insertErr

  // ✅ Insert into `referrals` table if referredById is present
  if (referredById) {
    const { error: referralInsertErr } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referredById,
        referred_id: uid,
        created_at: new Date(),
        level: 1, // ✅ Fix for NOT NULL "level" column constraint
      }])
    if (referralInsertErr) throw referralInsertErr
  }

  // 6️⃣ Insert starter `user_bank_info` row
  const { error: bankErr } = await supabase
    .from('user_bank_info')
    .insert([{
      user_id: uid,
      bank_name: '',
      account_name: '',
      account_number: '',
      created_at: new Date(),
    }])
  if (bankErr) throw bankErr

  return { uid, referralCode: myReferralCode }
}

/**
 * Log in a user and persist session.
 */
export async function loginProfile(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data.user
}

/**
 * Log out current user.
 */
export async function logoutProfile() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}

/**
 * Request password reset email.
 */
export async function resetPasswordRequest(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-confirm.html',
  })
  if (error) throw error
  return data
}

/**
 * Complete password reset (via token in URL).
 */
export async function resetPasswordConfirm(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return true
}

/**
 * Check if current user’s email is confirmed.
 */
export async function isEmailConfirmed() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return !!user?.email_confirmed_at
}
