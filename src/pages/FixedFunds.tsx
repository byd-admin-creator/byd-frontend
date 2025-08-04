// src/pages/FixedFunds.tsx
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'

type FixedFund = {
  id: string
  level: number
  duration_days: number
  active: boolean
  amount: number
  return_amount: number
}

export default function FixedFunds() {
  const [funds, setFunds] = useState<FixedFund[]>([])
  const [activatedIds, setActivatedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadFundsAndActivations = async () => {
    setLoading(true)

    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("Not logged in")
      const uid = user.id

      const [
        { data: fundRows, error: fundErr },
        { data: actRows, error: actErr }
      ] = await Promise.all([
        supabase
          .from('fixed_funds')
          .select('*')
          .eq('active', true)
          .order('level', { ascending: true }),

        supabase
          .from('user_fixed_fund_activations')
          .select('fixed_fund_id')
          .eq('user_id', uid)
      ])

      if (fundErr) toast.error('Failed to load funds')
      else setFunds(fundRows || [])

      if (actErr) toast.error('Failed to load your activations')
      else setActivatedIds((actRows || []).map((r) => String(r.fixed_fund_id)))

    } catch (err) {
      toast.error("Error loading data: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFundsAndActivations()
  }, [])

  const handleActivate = async (fundId: string) => {
    const { data: { user }, error: sessErr } = await supabase.auth.getUser()
    if (sessErr || !user) {
      toast.error('Please log in to activate')
      return
    }

    const uid = user.id
    const fund = funds.find(f => String(f.id) === fundId)

    if (!fund) {
      toast.error("Fund not found")
      return
    }

    const toastId = toast.loading('Checking balance…')

    // 🔐 Step 1: Attempt deduction via Supabase RPC
    const { data: success, error: rpcErr } = await supabase.rpc('deduct_withdrawable_balance', {
      p_user_id: uid,
      p_amount: fund.amount
    })

    if (rpcErr || !success) {
      toast.error('Insufficient balance or deduction failed', { id: toastId })
      return
    }

    // ✅ Step 2: Proceed with activation
    const { error: insertErr } = await supabase
      .from('user_fixed_fund_activations')
      .insert([{ user_id: uid, fixed_fund_id: fundId }])

    if (insertErr) {
      toast.error('Activation failed: ' + insertErr.message, { id: toastId })
    } else {
      toast.success('Activated successfully!', { id: toastId })

      // 🔄 Refresh activated list
      const { data: actRows, error: refetchErr } = await supabase
        .from('user_fixed_fund_activations')
        .select('fixed_fund_id')
        .eq('user_id', uid)

      if (refetchErr) {
        toast.error('Could not refresh activations')
      } else {
        setActivatedIds((actRows || []).map((r) => String(r.fixed_fund_id)))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 flex justify-center py-6">
        <div className="w-full max-w-[390px] px-4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Fixed Funds</h1>
          <div className="grid grid-cols-1 gap-5">
            {funds.map((f) => {
              const idStr = String(f.id)
              const activated = activatedIds.includes(idStr)
              const returnPct = Math.round((f.return_amount / f.amount) * 100)

              return (
                <div
                  key={idStr}
                  className="bg-gradient-to-r from-red-700 to-black text-white rounded-2xl shadow p-4 flex flex-col justify-between h-52"
                >
                  <div>
                    <h3 className="text-lg font-bold">LEVEL {f.level}</h3>
                    <p className="text-sm mt-1 font-bold">
                      ₦{f.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-400 mt-3">
                      Return After {f.duration_days} Days
                    </p>
                    <p className="text-green-500 font-bold text-lg">
                      ₦{f.return_amount.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-300">
                      {returnPct}% guaranteed
                    </span>
                  </div>
                  <button
                    onClick={() => handleActivate(idStr)}
                    disabled={activated}
                    className={`
                      mt-4 w-full py-2 rounded-lg font-semibold text-sm 
                      transition-transform transform 
                      ${activated
                        ? 'bg-gray-300 text-gray-800 cursor-not-allowed'
                        : 'bg-white text-red-700 hover:bg-red-100 hover:scale-105'}
                    `}
                  >
                    {activated ? 'Activated' : 'Activate'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
