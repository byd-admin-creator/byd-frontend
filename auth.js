// auth.js
import { supabase } from './supabaseClient.js'

/**
 * Sign up a user and save profile in `users` table.
 */
export async function signUpProfile(email, password, referredBy=null) {
  // 1. Auth signup
  const { data: authData, error: authErr } = 
    await supabase.auth.signUp({ email, password })
  if (authErr) throw authErr

  // 2. Generate referral code & insert profile
  const uid = authData.user.id
  const referralCode = uid.slice(0,8)
  const { error: dbErr } = 
    await supabase.from('users').insert([{
      id: uid,
      username: email,
      referral_code: referralCode,
      referred_by: referredBy
    }])
  if (dbErr) throw dbErr

  return { uid, referralCode }
}

/**
 * Log in a user.
 */
export async function loginProfile(email, password) {
  const { data, error } = 
    await supabase.auth.signInWithPassword({ email, password })
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
export async function resetPasswordRequest(email) {
  const { data, error } = 
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-confirm.html'
    })
  if (error) throw error
  return data
}

/**
 * Complete password reset (via token in URL).
 */
export async function resetPasswordConfirm(token, newPassword) {
  const { error } = 
    await supabase.auth.updateUser({ access_token: token, password: newPassword })
  if (error) throw error
  return true
}

/**
 * Check if current user’s email is confirmed.
 */
export async function isEmailConfirmed() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return !!data.user.confirmed_at
}

