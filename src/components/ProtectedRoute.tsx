// src/components/ProtectedRoute.tsx
import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        navigate('/')
      } else {
        setIsAuthenticated(true)
      }

      setChecking(false)
    })()
  }, [navigate])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Checking access...
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}
