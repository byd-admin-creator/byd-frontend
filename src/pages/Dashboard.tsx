// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownOnSquareIcon as DepositIcon,
  ArrowUpOnSquareIcon as WithdrawIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabaseClient'

interface Metrics {
  balance: number
  withdrawals: number
  referrals: number
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('User')
  const [metrics, setMetrics] = useState<Metrics>({
    balance: 0,
    withdrawals: 0,
    referrals: 0,
  })
  const [activeTab, setActiveTab] = useState<'activated' | 'unactivated'>(
    'activated'
  )

  useEffect(() => {
    ;(async () => {
      // 1) load session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      // 2) set username from metadata
      const u =
        (user.user_metadata as any)?.username ||
        user.email ||
        'User'
      setUsername(u)

      // 3) fetch metrics via RPC
      try {
        const { data, error } = await supabase
          .rpc('get_dashboard_metrics', { uid: user.id })
        if (error) {
          console.error('Metrics fetch error:', error)
          setMetrics({ balance: 0, withdrawals: 0, referrals: 0 })
        } else if (Array.isArray(data) && data.length > 0) {
          const row = data[0]
          setMetrics({
            balance: Number(row.balance) || 0,
            withdrawals: Number(row.total_withdrawal) || 0,
            referrals: Number(row.referrals) || 0,
          })
        } else {
          console.warn('No metrics data returned')
          setMetrics({ balance: 0, withdrawals: 0, referrals: 0 })
        }
      } catch (err) {
        console.error('Unexpected error fetching dashboard metrics:', err)
        setMetrics({ balance: 0, withdrawals: 0, referrals: 0 })
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-6">
      <div className="w-full max-w-[390px] px-4 space-y-6">
        {/* Greeting Row */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            Hello, {username}
          </h1>
        </div>

        {/* Balance Card */}
        <div
          className="w-full rounded-2xl p-5 text-white"
          style={{
            background: 'linear-gradient(90deg, #D32F2F 0%, #000000 100%)',
          }}
        >
          <p className="text-sm opacity-80">Total Balance</p>
          <p className="text-3xl font-bold mt-1">₦{metrics.balance.toLocaleString()}</p>
          <div className="flex justify-between mt-4 text-sm">
            <div>
              <p className="opacity-80">Withdrawals</p>
              <p className="font-semibold mt-0.5">₦{metrics.withdrawals.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="opacity-80">Referrals</p>
              <p className="font-semibold mt-0.5">{metrics.referrals}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/deposit')}
            className="bg-black rounded-lg p-3 flex flex-col items-center"
          >
            <DepositIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Deposit</span>
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="bg-black rounded-lg p-3 flex flex-col items-center"
          >
            <WithdrawIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Withdraw</span>
          </button>
          <button
            onClick={() =>
              window.open('https://t.me/byd_management', '_blank')
            }
            className="bg-black rounded-lg p-3 flex flex-col items-center ring-2 ring-white"
          >
            <DevicePhoneMobileIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Telegram</span>
          </button>
          <button
            onClick={() => navigate('/account')}
            className="bg-black rounded-lg p-3 flex flex-col items-center"
          >
            <ComputerDesktopIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Support</span>
          </button>
        </div>

        {/* Referral Link */}
        <div className="w-full bg-gray-300 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-black truncate">
            https://byd.ng/ref/{username}
          </span>
          <button className="bg-black text-red-500 px-3 py-1 rounded">
            Copy
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('activated')}
            className={`flex-1 py-2 text-sm font-medium rounded-l-lg border ${
              activeTab === 'activated'
                ? 'bg-black text-red-500 border-red-500'
                : 'bg-gray-300 text-gray-700 border-gray-300'
            }`}
          >
            Activated
          </button>
          <button
            onClick={() => setActiveTab('unactivated')}
            className={`flex-1 py-2 text-sm font-medium rounded-r-lg border ${
              activeTab === 'unactivated'
                ? 'bg-black text-gray-100 border-black'
                : 'bg-gray-300 text-gray-700 border-gray-300'
            }`}
          >
            Unactivated
          </button>
        </div>

        {/* Referral List */}
        <div className="bg-white rounded-lg p-4 text-center text-gray-500 text-sm">
          No {activeTab} referrals.
        </div>
      </div>
    </div>
  )
}
