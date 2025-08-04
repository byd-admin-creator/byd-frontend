import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface PresetAmount {
  value: number
  label: string
}

export default function Deposit() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustomActive, setIsCustomActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const presetAmounts: PresetAmount[] = [
    { value: 1000, label: '₦1,000' },
    { value: 5000, label: '₦5,000' },
    { value: 10000, label: '₦10,000' },
    { value: 20000, label: '₦20,000' },
    { value: 50000, label: '₦50,000' },
    { value: 100000, label: '₦100,000' },
  ]

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustomActive(false)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^\d]/g, '')
    setCustomAmount(digitsOnly)
    setSelectedAmount(null)
    setIsCustomActive(digitsOnly.length > 0)
  }

  const getActiveAmount = () =>
    isCustomActive && customAmount
      ? parseInt(customAmount, 10)
      : selectedAmount

  const activeAmount = getActiveAmount()
  const isButtonEnabled = !!activeAmount && activeAmount > 0

  const handleContinue = async () => {
    if (!isButtonEnabled || isSubmitting) return
    setIsSubmitting(true)

    const { data, error: userErr } = await supabase.auth.getUser()
    if (userErr || !data.user?.email) {
      alert('You must be logged in to deposit.')
      setIsSubmitting(false)
      return
    }

    const { error: insertErr } = await supabase.from('deposits').insert([
      {
        user_id: data.user.id,
        email: data.user.email,
        amount: activeAmount,
        status: 'pending',
      },
    ])
    if (insertErr) {
      console.error('Deposit insert error:', insertErr)
      alert('Failed to create deposit. Please try again.')
      setIsSubmitting(false)
      return
    }

    const paystackLink = `https://paystack.shop/pay/4r8g-m1uhw?email=${encodeURIComponent(
      data.user.email
    )}&amount=${activeAmount}`
    window.location.href = paystackLink
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Deposit Funds</h2>

        {/* Presets */}
        <div className="grid grid-cols-2 gap-4">
          {presetAmounts.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePresetClick(value)}
              className={`py-3 rounded-lg border text-sm font-medium focus:outline-none transition ${
                selectedAmount === value
                  ? 'border-red-500 bg-red-100 text-red-700'
                  : 'border-gray-300 text-gray-800 hover:border-red-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <input
          type="text"
          placeholder="Custom Amount"
          value={customAmount}
          onChange={handleCustomAmountChange}
          className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-800 focus:border-red-500 focus:ring-red-100"
        />

        {/* Total */}
        {activeAmount && (
          <div className="text-right">
            <span className="text-lg font-semibold text-gray-700">
              Total: ₦{activeAmount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!isButtonEnabled || isSubmitting}
          className={`w-full flex items-center justify-center py-3 rounded-lg text-white font-semibold transition ${
            isButtonEnabled
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <svg
              className="w-5 h-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            'Continue to Paystack'
          )}
        </button>
      </div>
    </div>
  )
}
