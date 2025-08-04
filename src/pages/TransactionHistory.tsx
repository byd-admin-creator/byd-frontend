'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.')
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)

      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) {
        console.error('User not authenticated')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.rpc('get_transaction_history', {
        user_id: user.id
      })

      if (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
      } else {
        setTransactions(data || [])
      }

      setLoading(false)
    }

    fetchTransactions()
  }, [])

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-red-900 w-[390px] min-h-screen mx-auto relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-red-600 to-red-700 shadow-2xl">
        <div className="bg-black/20 backdrop-blur-sm">
          <h2 className="text-center text-xl font-bold py-6 text-white tracking-wide">
            Transaction History
          </h2>
        </div>
        <div className="h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600"></div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 px-4 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="text-red-300 mt-6 font-medium">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-8 h-8 border-2 border-white/60 rounded-full"></div>
            </div>
            <p className="text-red-300 mt-6 font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                className="group relative transform transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 shadow-2xl border border-red-900/30 hover:border-red-600/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>

                  <div className="relative flex items-start justify-between">
                    <div className="flex flex-col space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                        <span className="text-xs text-red-300 font-medium tracking-wider">
                          {txn.created_at ? formatDate(txn.created_at) : ''}
                        </span>
                      </div>
                      <span className="font-semibold text-white text-sm capitalize tracking-wide">
                        {txn.type.replace(/_/g, ' ')}
                      </span>
                      {txn.description && (
                        <span className="text-xs text-gray-400 leading-relaxed">
                          {txn.description}
                        </span>
                      )}
                    </div>

                    {txn.amount !== null && (
                      <div className="flex flex-col items-end ml-4">
                        <div
                          className={`px-3 py-1 rounded-lg font-bold text-sm shadow-lg ${
                            txn.amount >= 0
                              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-600/30'
                              : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-600/30'
                          }`}
                        >
                          {txn.amount >= 0 ? '+' : '-'}₦
                          {Math.abs(txn.amount).toLocaleString()}
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            txn.amount >= 0 ? 'bg-green-400' : 'bg-red-400'
                          } shadow-lg`}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                </div>

                <div className="absolute inset-0 bg-red-600/10 rounded-xl transform translate-y-1 translate-x-1 -z-10 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom gradient mask */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
    </div>
  )
}
