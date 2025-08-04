// src/components/AdminProtectedRoute.tsx
import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface Props { children: ReactNode }

export default function AdminProtectedRoute({ children }: Props) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) {
        navigate('/admin')
        return
      }

      // Query the users table for is_admin
      const { data: userRow, error: profileError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profileError || !userRow?.is_admin) {
        navigate('/admin')
      } else {
        setIsAdmin(true)
      }

      setChecking(false)
    })()
  }, [navigate])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Verifying admin access…
      </div>
    )
  }

  return isAdmin ? <>{children}</> : null
}
