import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface PresetAmount {
  value: number;
  label: string;
}

export default function Deposit() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);

  const presetAmounts: PresetAmount[] = [
    { value: 1000, label: '₦1,000' },
    { value: 5000, label: '₦5,000' },
    { value: 10000, label: '₦10,000' },
    { value: 20000, label: '₦20,000' },
    { value: 50000, label: '₦50,000' },
    { value: 100000, label: '₦100,000' }
  ];

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustomActive(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
    setIsCustomActive(value.length > 0);
  };

  const getActiveAmount = (): number | null => {
    if (isCustomActive && customAmount) {
      return parseInt(customAmount);
    }
    return selectedAmount;
  };

  const activeAmount = getActiveAmount();
  const isButtonEnabled = activeAmount !== null && activeAmount > 0;

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Deposit</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {presetAmounts.map((amount) => (
          <button
            key={amount.value}
            onClick={() => handlePresetClick(amount.value)}
            className={`py-3 px-4 rounded-lg border font-semibold ${
              selectedAmount === amount.value
                ? 'border-red-500 bg-red-100 text-red-700'
                : 'border-gray-300 text-black'
            }`}
          >
            {amount.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Custom Amount"
        value={customAmount}
        onChange={handleCustomAmountChange}
        className="w-full py-3 px-4 border rounded mb-6"
      />

      {activeAmount && (
        <div className="mb-4">
          <p className="text-lg font-semibold">Total: ₦{activeAmount.toLocaleString()}</p>
        </div>
      )}

      <button
        disabled={!isButtonEnabled}
        onClick={async () => {
          const amount = getActiveAmount();
          if (!amount || amount <= 0) return;

          const {
            data: { user },
            error: sessionError
          } = await supabase.auth.getUser();

          if (sessionError || !user || !user.email) {
            alert('You must be logged in to deposit.');
            return;
          }

          const { error } = await supabase.from('deposits').insert([
            {
              user_id: user.id,
              email: user.email,
              amount,
              status: 'pending'
            }
          ]);

          if (error) {
            console.error('❌ Failed to create deposit:', error);
            alert('Error saving deposit. Try again.');
            return;
          }

          const paystackLink = `https://paystack.shop/pay/hra-y8mq7s?email=${encodeURIComponent(
            user.email
          )}&amount=${amount * 1}`;

          window.location.href = paystackLink;
        }}
        className={`w-full py-3 rounded text-white font-semibold ${
          isButtonEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Continue to Paystack
      </button>
    </div>
  );
}
