// ActivityFunds.tsx — updated to use server-side aggregate & transactional RPCs
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast, { Toaster } from 'react-hot-toast'

const LEVELS = [
  { level: 1, base: 3000 },
  { level: 2, base: 5000 },
  { level: 3, base: 10000 },
  { level: 4, base: 15000 },
  { level: 5, base: 20000 },
  { level: 6, base: 30000 },
  { level: 7, base: 40000 },
  { level: 8, base: 50000 },
  { level: 9, base: 80000 },
  { level: 10, base: 100000 },
] as const

const MULTIPLIER = 2.0
const REFERRALS_REQUIRED_PER_CLAIM = 3

interface LevelReport {
  level: number
  total_eligible_referrals: number
  claims_count: number
  used_referrals: number
  available_referrals: number
  can_claim: boolean
}

export default function ActivityFunds() {
  const [reports, setReports] = useState<Record<number, LevelReport>>({})
  const [loading, setLoading] = useState(true)
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser()

      if (userErr || !user) throw new Error('Not logged in')
      const uid = user.id

      // Call the server-side aggregate function that returns per-level data
      const { data, error } = await supabase.rpc('get_activity_fund_report', {
        p_user_id: uid
      })

      if (error) {
        console.error('Failed to load activity fund report:', error)
        toast.error('Failed to load activity funds')
        setReports({})
        return
      }

      // data is expected to be an array of rows (one per level)
      const mapped: Record<number, LevelReport> = {}
      for (const row of (data as any[]) || []) {
        const lvl = Number(row.level)
        mapped[lvl] = {
          level: lvl,
          total_eligible_referrals: Number(row.total_eligible_referrals ?? 0),
          claims_count: Number(row.claims_count ?? 0),
          used_referrals: Number(row.used_referrals ?? 0),
          available_referrals: Number(row.available_referrals ?? 0),
          can_claim: Boolean(row.can_claim)
        }
      }

      setReports(mapped)
    } catch (e) {
      console.error(e)
      toast.error((e as Error).message || 'Error loading data')
      setReports({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClaim = async (lvl: number) => {
    setClaimingLevel(lvl)
    try {
      const {
        data: { user },
        error: sessErr
      } = await supabase.auth.getUser()
      if (sessErr || !user) throw new Error('Not logged in')

      // Call transactional RPC to perform the claim safely server-side
      const { data, error } = await supabase.rpc('claim_activity_fund', {
        p_user_id: user.id,
        p_level: lvl
      })

      if (error) throw error

      // RPC returns a result row (success boolean + message + metadata)
      const result = Array.isArray(data) ? data[0] : data

      if (!result) throw new Error('Unexpected response from server')

      if (result.success !== true) {
        // Server-side rejection (e.g., insufficient referrals)
        throw new Error(result.message || 'Claim rejected by server')
      }

      // Calculate payout locally (display only)
      const base = LEVELS.find((l) => l.level === lvl)?.base || 0
      const payout = base * MULTIPLIER

      toast.success(`Claim successful — ₦${payout.toLocaleString()}`)
      // Refresh data so the cycle restarts / updates
      await loadData()
    } catch (e) {
      console.error('Claim failed', e)
      toast.error('Claim failed: ' + ((e as Error).message || 'Unknown error'))
    } finally {
      setClaimingLevel(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Activity Funds</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVELS.map(({ level, base }) => {
          const payout = base * MULTIPLIER
          const report = reports[level] || {
            level,
            total_eligible_referrals: 0,
            claims_count: 0,
            used_referrals: 0,
            available_referrals: 0,
            can_claim: false
          }

          // Display values from server
          const { total_eligible_referrals, used_referrals, available_referrals, can_claim } = report

          return (
            <div
              key={level}
              className="bg-gradient-to-br from-red-600 to-black text-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="text-sm font-semibold uppercase opacity-90">
                  Level {level}
                </div>

                <div className="mt-4 mb-2">
                  <p className="text-2xl font-extrabold">
                    ₦{payout.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-200">{MULTIPLIER}× payout</p>
                </div>

                <div className="mt-6">
                  <p className="text-sm mb-1">
                    Eligible referrals: <span className="font-semibold">{total_eligible_referrals}</span>
                  </p>
                  <p className="text-xs text-gray-200 mb-3">
                    Used: {used_referrals} • Available: {available_referrals}
                  </p>

                  <p className="text-sm mb-2">
                    Need: <span className="font-semibold">{REFERRALS_REQUIRED_PER_CLAIM}</span> available referrals to claim
                  </p>

                  <button
                    onClick={() => handleClaim(level)}
                    disabled={!can_claim || claimingLevel === level}
                    className={`w-full py-2 rounded-md text-sm font-semibold transition
                      ${claimingLevel === level
                        ? 'bg-yellow-500 text-white'
                        : !can_claim
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-white text-red-600 hover:bg-red-100'
                      }`}
                  >
                    {claimingLevel === level ? 'Processing...' : can_claim ? 'Claim' : 'Pending'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
