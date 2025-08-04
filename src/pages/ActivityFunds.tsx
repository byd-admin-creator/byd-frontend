// ActivityFunds.tsx — updated for 3-referral-per-claim with 2× payout

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

interface ClaimRow {
  level: number
  claim_version: number
}

export default function ActivityFunds() {
  const [refCounts, setRefCounts] = useState<Record<number, number>>({})
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("Not logged in")
      const uid = user.id

      const [refResult, claimResult] = await Promise.all([
        supabase
          .from('referrals')
          .select('level')
          .eq('referrer_id', uid),

        supabase
          .from('activity_fund_claims')
          .select('level, claim_version')
          .eq('user_id', uid)
      ])

      if (refResult.error) toast.error('Failed to load referrals')
      else {
        const counts: Record<number, number> = {}
        for (const r of refResult.data || []) {
          counts[r.level] = (counts[r.level] || 0) + 1
        }
        setRefCounts(counts)
      }

      if (claimResult.error) toast.error('Failed to load claims')
      else setClaims(claimResult.data || [])

    } catch (e) {
      console.error(e)
      toast.error((e as Error).message || "Error loading data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleClaim = async (lvl: number) => {
    setClaimingLevel(lvl)
    try {
      const { data: { user }, error: sessErr } = await supabase.auth.getUser()
      if (sessErr || !user) throw new Error("Not logged in")

      const { data, error } = await supabase.rpc('claim_activity_fund', {
        p_user_id: user.id,
        p_level: lvl,
      })

      if (error) throw error

      toast.success(`Claimed ₦${(data.payout || 0).toLocaleString()}`)
      await loadData()

    } catch (e) {
      toast.error("Claim failed: " + (e as Error).message)
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
          const timesClaimed = claims.filter(c => c.level === level).length
          const requiredReferrals = (timesClaimed + 1) * 3
          const currentReferrals = refCounts[level] || 0
          const canClaim = currentReferrals >= requiredReferrals

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
                  <p className="text-sm mb-2">
                    Referrals: <span className="font-semibold">{currentReferrals}</span> / {requiredReferrals}
                  </p>

                  <button
                    onClick={() => handleClaim(level)}
                    disabled={!canClaim || claimingLevel === level}
                    className={`w-full py-2 rounded-md text-sm font-semibold transition
                      ${claimingLevel === level
                        ? 'bg-yellow-500 text-white'
                        : !canClaim
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-white text-red-600 hover:bg-red-100'
                      }`}
                  >
                    {claimingLevel === level
                      ? 'Processing...'
                      : canClaim
                      ? 'Claim'
                      : 'Pending'}
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
