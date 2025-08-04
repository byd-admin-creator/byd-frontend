import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const fetchUserAndBalance = async () => {
      timeout = setTimeout(() => setLoading(true), 250) // Only show loading if delay exceeds 250ms

      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        console.error('User fetch error:', error)
        clearTimeout(timeout)
        setLoading(false)
        return
      }

      setUser(data.user)

      const { data: balData, error: balErr } = await supabase
        .rpc('get_balance', { uid: data.user.id })

      if (balErr) console.error('Balance RPC error:', balErr)
      else setBalance(balData || 0)

      clearTimeout(timeout)
      setLoading(false)
    }

    fetchUserAndBalance()

    return () => clearTimeout(timeout)
  }, [])

  const username = user?.user_metadata?.username || 'User'
  const email = user?.email || ''
  const avatarLetter = username.charAt(0).toUpperCase()

  const menu = [
    {
      label: 'Bind Account',
      path: '/account/bind-account',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      label: 'Transaction History',
      path: '/account/transaction-history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: 'Support Center',
      path: '/account/customer-support',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V19.5a.75.75 0 01.75-.75zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM18.75 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H19.5a.75.75 0 01-.75-.75z" />
        </svg>
      )
    },
    {
      label: 'Reset Password',
      path: '/account/reset-password',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-700 font-medium">Loading account...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[390px] px-6 pt-6 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-red-700">BYD MANAGEMENT</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your profile and settings</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-white font-semibold text-xl">
              {avatarLetter}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-red-500">{username}</h2>
              <p className="text-sm text-gray-400 mt-1">{email}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500 font-medium">Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-500 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Account Balance
            </h3>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm text-gray-600 mt-2">Available for transactions</p>
        </motion.div>

        {/* Menu Options */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-4">
            Account Services
          </h3>
          {menu.map(({ label, path, icon }, index) => (
            <motion.button
              key={label}
              onClick={() => navigate(path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200
                         hover:shadow-md hover:border-gray-300 focus:ring-2 focus:ring-gray-900 
                         focus:outline-none transition-all duration-200 group text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600 group-hover:text-gray-900 transition-colors">
                    {icon}
                  </div>
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Protected by Top-level security</p>
          </div>
        </div>
      </div>
    </div>
  )
}
