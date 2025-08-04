 /**
 * src/hooks/useAdminGuard.ts
 * Hook to guard admin-only routes using supabase session.
 * - Redirects to /login if no session.
 * - Redirects to / if user is not admin.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
export function useAdminGuard() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkAdmin = async () => {
      console.log('[AdminGuard] Checking session...')
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log('[AdminGuard] Session:', session, 'Error:', sessionError)

      if (sessionError || !session) {
        console.log('[AdminGuard] No session, redirecting to /login...')
        if (isMounted) navigate('/login')
        return
      }

      console.log('[AdminGuard] Session found, checking admin status...')

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      console.log('[AdminGuard] Profile:', profile, 'Error:', profileError)

      if (profileError || !profile?.is_admin) {
        console.log('[AdminGuard] Not an admin, redirecting to /')
        if (isMounted) navigate('/')
      } else {
        console.log('[AdminGuard] ✅ Verified admin access granted.')
        if (isMounted) setChecking(false)
      }
    }

    checkAdmin()

    return () => {
      isMounted = false
      console.log('[AdminGuard] Cleanup')
    }
  }, [navigate])

  console.log('[AdminGuard] Returning checking:', checking)
  return checking
}
