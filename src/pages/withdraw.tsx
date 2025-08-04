// src/pages/Withdraw.tsx

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface BankInfo {
  account_name: string
  account_number: string
  bank_name: string
}

export default function WithdrawPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number>(0)
  const [bank, setBank] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sectionLoading, setSectionLoading] = useState<boolean>(false)
  const [amount, setAmount] = useState<number>(0)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { data, error: sessErr } = await supabase.auth.getSession()
        const session = data.session
        if (sessErr || !session?.user) {
          console.error('Session error', sessErr)
          setLoading(false)
          return
        }
        const uid = session.user.id

        const [balRes, bankRes] = await Promise.all([
          supabase.rpc('get_balance', { uid }),
          supabase
            .from('user_bank_info')
            .select('account_name, account_number, bank_name')
            .eq('user_id', uid)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single(),
        ])

        if (balRes.error) {
          console.error('Balance fetch error', balRes.error)
        } else {
          setBalance(balRes.data ?? 0)
        }

        if (bankRes.error) {
          console.error('Bank info fetch error', bankRes.error)
        } else if (bankRes.data) {
          setBank(bankRes.data as BankInfo)
        }
      } catch (error) {
        console.error('Unexpected load error', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const fee = +(amount * 0.1).toFixed(2)
  const net = +(amount - fee).toFixed(2)

  const handleWithdraw = async () => {
    if (amount < 1000) {
      setMessage('Minimum withdrawal is ₦1,000.')
      return
    }
    if (amount + fee > balance) {
      setMessage('Insufficient balance including fees.')
      return
    }
    if (!bank) {
      setMessage('Please bind your bank account first.')
      return
    }

    setMessage('')
    setSectionLoading(true)
    try {
      const { data, error: sessErr } = await supabase.auth.getSession()
      const session = data.session
      if (sessErr || !session?.user) {
        setMessage('You must be logged in.')
        setSectionLoading(false)
        return
      }
      const uid = session.user.id

      const { error: rpcErr } = await supabase.rpc('withdraw_request', {
        uid,
        amt: amount,
      })

      if (rpcErr) {
        console.error('Withdrawal request error', rpcErr)
        setMessage('Withdrawal failed: ' + rpcErr.message)
      } else {
        setMessage('Withdrawal requested successfully. Status: pending.')
        const { data: newBal, error: balErr } = await supabase.rpc('get_balance', { uid })
        if (!balErr && newBal !== null) {
          setBalance(newBal)
        }
        setAmount(0)
      }
    } catch (error) {
      console.error('Unexpected withdraw error', error)
      setMessage('Unexpected error occurred.')
    } finally {
      setSectionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading account data…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4">
      <div className="w-full max-w-[390px] space-y-6">
        {/* Balance */}
        <div className="bg-gradient-to-br from-red-800 to-black text-white rounded-2xl p-6">
          <p className="text-sm opacity-75">Available Balance</p>
          <p className="text-3xl font-bold mt-1">
            ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Bank Info */}
        <div className="bg-gray-200 rounded-2xl p-4">
          {bank ? (
            <>
              <p className="text-sm font-medium text-gray-700 mb-2">Bank Account Details</p>
              <div className="bg-black rounded-xl p-4 shadow">
                <p><span className="font-semibold">Name:</span> {bank.account_name}</p>
                <p><span className="font-semibold">Number:</span> {bank.account_number}</p>
                <p><span className="font-semibold">Bank:</span> {bank.bank_name}</p>
              </div>
              <button
                onClick={() => navigate('/account/bind-account')}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Update Bank Details
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/account/bind-account')}
              className="w-full bg-white rounded-xl py-3 shadow text-red-600 font-medium hover:bg-gray-100 transition"
            >
              Bind Bank Account
            </button>
          )}
        </div>

        {/* Withdraw Form */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <label className="block text-gray-700 mb-1">Withdrawal Amount</label>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">₦</span>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              placeholder="Enter amount"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Processing fee (10%): ₦{fee.toLocaleString()} • You’ll receive ₦{net.toLocaleString()}
          </p>
          {message && <p className="text-sm text-green-600 mb-2">{message}</p>}
          <motion.button
            onClick={handleWithdraw}
            disabled={sectionLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-br from-red-800 to-black text-white rounded-xl py-3 font-semibold disabled:opacity-50 transition"
          >
            {sectionLoading ? 'Processing…' : 'Withdraw Now'}
          </motion.button>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>• Minimum withdrawal is ₦1,000.</p>
          <p>• Processing may take up to 6 hours due to bank network delays.</p>
          <p>• Ensure your bank account details are correct before submitting.</p>
        </div>
      </div>
    </div>
  )
}
