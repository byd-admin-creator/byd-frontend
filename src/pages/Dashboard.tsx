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

interface ReferredUser {
  id: string
  username: string | null
  full_name: string | null
  email: string
  activatedLevels: number[]
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('User')
  const [referralCode, setReferralCode] = useState('')
  const [metrics, setMetrics] = useState<Metrics>({ balance: 0, withdrawals: 0, referrals: 0 })
  const [copied, setCopied] = useState(false)
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [fixedFundLevelMap, setFixedFundLevelMap] = useState<Record<string, number>>({})

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('username, referral_code')
        .eq('id', user.id)
        .single()
      if (userData) {
        setUsername(userData.username || user.email || 'User')
        setReferralCode(userData.referral_code || '')
      }

      const { data: metricsData } = await supabase.rpc('get_dashboard_metrics', { uid: user.id })
      if (Array.isArray(metricsData) && metricsData.length) {
        const row = metricsData[0]
        setMetrics({
          balance: Number(row.balance) || 0,
          withdrawals: Number(row.total_withdrawal) || 0,
          referrals: Number(row.referrals) || 0,
        })
      }

      const { data: fixedFunds } = await supabase.from('fixed_funds').select('id, level')
      const fundMap: Record<string, number> = {}
      fixedFunds?.forEach(f => { if (f.id && f.level != null) fundMap[f.id] = f.level })
      setFixedFundLevelMap(fundMap)

      const { data: users } = await supabase
        .from('users')
        .select('id, username, email, full_name, user_fixed_fund_activations(fixed_fund_id,is_active)')
        .eq('referred_by', user.id)
      const formatted = (users || []).map(u => {
        const activeLevels =
          (u.user_fixed_fund_activations || [])
            .filter(a => a.is_active)
            .map(a => fundMap[a.fixed_fund_id])
            .filter((lvl): lvl is number => lvl != null)
        return {
          id: u.id,
          username: u.username,
          full_name: u.full_name,
          email: u.email || '',
          activatedLevels: Array.from(new Set(activeLevels)),
        }
      })
      setReferredUsers(formatted)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-6">
      <div className="w-full max-w-[390px] px-4 space-y-6">
        {/* Greeting */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            Hello, {username}
          </h1>
        </div>

        {/* Balance Card */}
        <div
          className="w-full rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(90deg, #D32F2F 0%, #000 100%)' }}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => navigate('/deposit')} className="bg-black rounded-lg p-3 flex flex-col items-center">
            <DepositIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Deposit</span>
          </button>
          <button onClick={() => navigate('/withdraw')} className="bg-black rounded-lg p-3 flex flex-col items-center">
            <WithdrawIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Withdraw</span>
          </button>
          <button onClick={() => window.open('https://t.me/byd_management', '_blank')} className="bg-black rounded-lg p-3 flex flex-col items-center ring-2 ring-white">
            <DevicePhoneMobileIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Telegram</span>
          </button>
          <button onClick={() => navigate('/account')} className="bg-black rounded-lg p-3 flex flex-col items-center">
            <ComputerDesktopIcon className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-white">Support</span>
          </button>
        </div>

        {/* Referral Code (raw) */}
        <div className="w-full bg-gray-300 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-black truncate">https://bydmanagement.name.ng/signup?ref={referralCode || 'N/A'}</span>
          <button onClick={handleCopy} className="bg-black text-red-500 px-3 py-1 rounded text-xs">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Referrals Section: Professional, White Card */}
        <div className="w-full bg-white rounded-2xl p-4 shadow-md max-h-80 overflow-y-auto">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-3">Your Referrals</h2>
          {referredUsers.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">You have no referrals yet.</div>
          ) : (
            <ul className="space-y-2">
              {referredUsers.map(u => (
                <li key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-800 truncate">{u.username || u.full_name || u.email}</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 10 }, (_, i) => {
                      const lvl = i + 1
                      const active = u.activatedLevels.includes(lvl)
                      return (
                        <span
                          key={lvl}
                          className={`w-5 h-5 text-[10px] flex items-center justify-center rounded-full font-medium ${
                            active ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {lvl}
                        </span>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
