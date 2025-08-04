import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'

type WelfareFund = {
  id: string
  level: number
  duration: number
  active: boolean
  amount: number
  multiplier: number
}

export default function WelfareFunds() {
  const [funds, setFunds] = useState<WelfareFund[]>([])
  const [activatedWelfareIds, setActivatedWelfareIds] = useState<string[]>([])
  const [activatedFixedFundLevels, setActivatedFixedFundLevels] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const loadFundsAndActivations = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()

      if (userErr || !user) throw new Error('Authentication error')

      const [fundsRes, welfareRes, fixedRes] = await Promise.all([
        supabase
          .from('welfare_packages')
          .select('*')
          .eq('active', true)
          .order('level', { ascending: true }),

        supabase
          .from('welfare_fund_investments')
          .select('welfare_package_id')
          .eq('user_id', user.id),

        supabase
          .from('user_fixed_fund_activations')
          .select('fixed_fund_id, fk_to_fixed_funds!inner(level)')
          .eq('user_id', user.id),
      ])

      if (fundsRes.error) throw fundsRes.error
      if (welfareRes.error) throw welfareRes.error
      if (fixedRes.error) throw fixedRes.error

      setFunds(fundsRes.data || [])
      setActivatedWelfareIds((welfareRes.data || []).map((r) => String(r.welfare_package_id)))

      const levels = (fixedRes.data || [])
        .filter((r: any) => r.fk_to_fixed_funds)
        .map((r: any) => r.fk_to_fixed_funds.level)

      setActivatedFixedFundLevels(levels)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkLoginAndTriggerPayouts = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return

      try {
        const { error: payoutErr } = await supabase.rpc('process_user_welfare_payouts', {
          p_user_id: user.id,
        })

        if (payoutErr) {
          console.error('RPC failed:', payoutErr.message)
        }
      } catch (e: any) {
        console.error('Welfare payout RPC failed:', e.message)
      }
    }

    checkLoginAndTriggerPayouts()
    loadFundsAndActivations()
  }, [])

  const handleActivate = async (fundId: string, level: number) => {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      toast.error('Please log in to activate')
      return
    }

    const alreadyActivated = activatedWelfareIds.includes(fundId)
    const eligible = activatedFixedFundLevels.includes(level)

    if (!eligible) {
      toast('You must activate the corresponding Fixed Fund level first.', {
        icon: '⚠️',
      })
      return
    }

    if (alreadyActivated) {
      toast('Already activated.', {
        icon: '⚠️',
      })
      return
    }

    const fund = funds.find(f => String(f.id) === fundId)
    if (!fund) {
      toast.error('Fund not found')
      return
    }

    const toastId = toast.loading("Activating...")

    const { data: userData, error: userErr2 } = await supabase
      .from("users")
      .select("withdrawable_balance")
      .eq("id", user.id)
      .single()

    if (userErr2 || !userData) {
      toast.error("Unable to fetch balance", { id: toastId })
      return
    }

    if (userData.withdrawable_balance < fund.amount) {
      toast.error("Insufficient balance", { id: toastId })
      return
    }

    const { error: rpcErr } = await supabase.rpc("activate_welfare_fund", {
      user_id_input: user.id,
      package_id_input: fundId,
    })

    if (rpcErr) {
      toast.error("Activation failed: " + rpcErr.message, { id: toastId })
    } else {
      toast.success("Welfare package activated.", { id: toastId })
      setActivatedWelfareIds((prev) => [...prev, fundId])
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
          <h1 className="text-2xl font-bold text-gray-800">Welfare Funds</h1>
          <div className="grid grid-cols-1 gap-5">
            {funds.map((fund) => {
  const fundIdStr = String(fund.id)
  const isUnlocked = activatedFixedFundLevels.includes(fund.level)
  const isActivated = activatedWelfareIds.includes(fundIdStr)

  const returnAmount = fund.amount * fund.multiplier
  const returnPct = fund.amount ? Math.round((returnAmount / fund.amount) * 100) : 0
  const dailyPayout = fund.duration > 0 ? returnAmount / fund.duration : 0

  return (
    <div
      key={fundIdStr}
      className={`${
        isUnlocked 
          ? 'bg-gradient-to-r from-red-700 to-black' 
          : 'bg-gradient-to-r from-gray-500 to-gray-700'
      } text-white rounded-2xl shadow p-4 flex flex-col justify-between h-56`}
    >
      <div>
        <h3 className="text-lg font-bold">LEVEL {fund.level}</h3>
        <p className="text-sm mt-1 font-bold">
          ₦{fund.amount.toLocaleString()}
        </p>
        <p className="text-xs text-yellow-400 mt-2">
          Total Duration: {fund.duration} Days
        </p>
        <p className="text-xs text-green-300 mt-1">
          Daily Payout: ₦{dailyPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-green-500 font-bold text-lg mt-1">
          ₦{returnAmount.toLocaleString()}
        </p>
        <span className="text-xs text-gray-300">
          {returnPct}% guaranteed
        </span>
      </div>
      <button
        onClick={() => handleActivate(fundIdStr, fund.level)}
        disabled={!isUnlocked || isActivated}
        className={`mt-4 w-full py-2 rounded-lg font-semibold text-sm 
          transition-transform transform 
          ${isActivated
            ? 'bg-gray-300 text-gray-800 cursor-not-allowed'
            : isUnlocked
              ? 'bg-white text-red-700 hover:bg-red-100 hover:scale-105'
              : 'bg-gray-300 text-gray-800 cursor-not-allowed'}
        `}
      >
        {isActivated ? 'Activated' : isUnlocked ? 'Activate' : '🔒 Not Eligible'}
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
