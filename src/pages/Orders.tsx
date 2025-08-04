import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Orders() {
  const [fixedFundOrders, setFixedFundOrders] = useState<any[]>([])
  const [welfareFundOrders, setWelfareFundOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()

      if (userErr || !user?.id) return

      const userId = user.id

      const [fixedRes, welfareRes] = await Promise.all([
        supabase
          .from('user_fixed_fund_activations')
          .select('id, is_active, fixed_fund:fixed_fund_id(level, amount)')
          .eq('user_id', userId)
          .eq('is_active', true),
        supabase
          .from('welfare_fund_investments')
          .select('id, is_active, welfare_package:welfare_package_id(level, amount, multiplier)')
          .eq('user_id', userId)
          .eq('is_active', true),
      ])

      if (fixedRes?.data) setFixedFundOrders(fixedRes.data)
      if (welfareRes?.data) setWelfareFundOrders(welfareRes.data)

      setLoading(false)
    }

    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">
      {/* Fixed Fund Orders */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Fixed Fund Orders</h1>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : fixedFundOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow text-gray-600">
            You haven't activated any Fixed Fund level yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fixedFundOrders.map(({ id, fixed_fund }) => {
              const { level, amount } = fixed_fund || {}
              const returnAfter31Days = amount * 3

              return (
                <div
                  key={`fixed-${id}`}
                  className="bg-gradient-to-br from-red-600 to-black text-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition"
                >
                  <div className="flex flex-col space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-widest text-gray-200">Fixed Level {level}</p>
                      <p className="text-2xl font-bold text-white">₦{amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-300 mt-1">Invested Amount</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-200">Return after 31 days</p>
                      <p className="text-lg font-semibold text-lime-300">₦{returnAfter31Days.toLocaleString()}</p>
                    </div>

                    <div className="mt-auto text-xs text-gray-400">
                      Status: <span className="text-white font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Welfare Fund Orders */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Welfare Fund Orders</h1>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : welfareFundOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow text-gray-600">
            You haven't activated any Welfare Fund level yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {welfareFundOrders.map(({ id, welfare_package }) => {
              const { level, amount, multiplier } = welfare_package || {}
              const totalReturn = amount * (multiplier || 2)

              return (
                <div
                  key={`welfare-${id}`}
                  className="bg-gradient-to-br from-lime-600 to-black text-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition"
                >
                  <div className="flex flex-col space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-widest text-gray-200">Welfare Level {level}</p>
                      <p className="text-2xl font-bold text-white">₦{amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-300 mt-1">Invested Amount</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-200">Total Payout</p>
                      <p className="text-lg font-semibold text-yellow-300">₦{totalReturn.toLocaleString()}</p>
                    </div>

                    <div className="mt-auto text-xs text-gray-400">
                      Status: <span className="text-white font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
