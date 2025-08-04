// src/pages/SetWithdrawalPin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SetWithdrawalPin() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingPin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('withdrawal_pin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error(error);
      } else if (data?.withdrawal_pin) {
        toast.success('You already have a withdrawal PIN set.');
        navigate('/account');
      }
    };

    checkExistingPin();
  }, [navigate]);

  const handleSubmit = async () => {
    if (pin.length !== 4 || isNaN(Number(pin))) {
      toast.error('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match.');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update({ withdrawal_pin: pin }) // consider hashing before saving for security
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Withdrawal PIN set successfully!');
      navigate('/account');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to set PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Set Withdrawal PIN</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Please set a 4-digit withdrawal PIN for your account security.
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="Enter 4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-center text-lg"
        />

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="Confirm 4-digit PIN"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-center text-lg"
        />

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-red-800 to-black hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Setting PIN...' : 'Set PIN'}
        </button>
      </div>
    </div>
  );
}
