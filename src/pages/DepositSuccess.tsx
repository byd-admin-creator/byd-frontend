import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const DepositSuccess = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [reference, setReference] = useState('');
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ref = query.get('reference');
    setReference(ref || '');

    const fetchWallet = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('withdrawable_balance')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setBalance(data.withdrawable_balance);
      }

      setLoading(false);
    };

    fetchWallet();
  }, [location.search]);

  if (loading) return <p>⏳ Verifying payment...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-600">✅ Deposit Successful</h1>
      <p className="mt-4">💼 New Balance: ₦{balance?.toLocaleString()}</p>
      <p className="mt-2">🔁 Reference: <span className="font-mono">{reference}</span></p>
      <p className="text-sm mt-4 text-gray-500">Thank you for your deposit.</p>
    </div>
  );
};

export default DepositSuccess;
