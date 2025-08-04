// src/pages/BindAccountPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "GTBank", code: "058" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank", code: "011" },
  { name: "UBA", code: "033" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Ecobank", code: "050" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Union Bank", code: "032" },
  { name: "Wema Bank", code: "035" },
  { name: "Sterling Bank", code: "232" },
  { name: "Polaris Bank", code: "076" },
  { name: "Keystone Bank", code: "082" },
  { name: "Heritage Bank", code: "030" },
  { name: "Unity Bank", code: "215" },
  { name: "Jaiz Bank", code: "301" },
  { name: "SunTrust Bank", code: "100" },
  { name: "Providus Bank", code: "101" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Globus Bank", code: "103" },
  { name: "Parallex Bank", code: "104" },
  { name: "TAJ Bank", code: "302" },
  { name: "Lotus Bank", code: "105" },
  { name: "Opay", code: "999991" },
  { name: "Kuda Bank", code: "999992" },
  { name: "PalmPay", code: "999993" },
  { name: "Rubies Bank", code: "125" },
  { name: "VFD MFB", code: "566" },
  { name: "MONIEPOINT MFB", code: "01575" },
];

interface BankInfo {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface Bank {
  name: string;
  code: string;
}

export default function BindAccountPage() {
  const navigate = useNavigate();
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [form, setForm] = useState<BankInfo>({ bank_name: '', account_number: '', account_name: '' });
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const { data, error } = await supabase
        .from('user_bank_info')
        .select('bank_name,account_number,account_name')
        .eq('user_id', user.id)
        .single();
      if (data && !error) {
        setBankInfo(data);
        setForm(data);
        setShowCard(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('https://api.paystack.co/bank', {
          headers: { Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_SECRET_KEY}` },
        });
        setBanks(res.data.data.length ? res.data.data : NIGERIAN_BANKS);
      } catch {
        setBanks(NIGERIAN_BANKS);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!form.bank_name || !form.account_number || !form.account_name) {
      setMessage('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');
      const uid = user.id;
      const payload = { ...form, updated_at: new Date() };
      const res = bankInfo
        ? await supabase.from('user_bank_info').update(payload).eq('user_id', uid)
        : await supabase.from('user_bank_info').insert([{ user_id: uid, ...payload }]);
      if (res.error) throw res.error;
      setBankInfo(form);
      setShowCard(true);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const containerClass = "min-h-[844px] w-[330px] mx-auto flex items-center justify-center";

  if (showCard && bankInfo) {
    return (
      <div className={containerClass + " bg-gray-50 p-4"}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Successfully Linked</h2>
            <p className="text-gray-600 text-sm">Your bank account has been securely connected</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-red-900 to-black rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 w-24 h-24 border border-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-full"></div>
            </div>

            <div className="relative z-10 mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold tracking-wide">LINKED ACCOUNT</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-300 font-medium">ACTIVE</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 uppercase tracking-widest">SECURE BANKING CONNECTION</p>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">FINANCIAL INSTITUTION</p>
                <p className="text-xl font-bold">{bankInfo.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">ACCOUNT NUMBER</p>
                <p className="text-2xl font-mono font-bold tracking-widest">{formatAccountNumber(bankInfo.account_number)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">ACCOUNT HOLDER</p>
                <p className="text-lg font-semibold capitalize">{bankInfo.account_name.toLowerCase()}</p>
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <button onClick={() => setShowCard(false)} className="text-sm text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Details</span>
              </button>
              <button onClick={() => navigate('/account')} className="px-6 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={containerClass + " bg-gray-50 p-4 overflow-y-auto"}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-black to-red-900 px-4 py-5 text-white">
          <h1 className="text-xl font-semibold">{bankInfo ? 'Update Bank Account' : 'Link Bank Account'}</h1>
          <p className="text-sm text-gray-200 mt-1">{bankInfo ? 'Modify your account details' : 'Add your Nigerian bank details'}</p>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
            <select
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
            >
              <option value="">Select your bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
            <input
              type="text"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">{form.account_number.length}/10 digits</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              placeholder="Enter account name exactly"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>

          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={loading || !form.bank_name || !form.account_number || !form.account_name}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-800 to-black text-white rounded-lg font-medium disabled:opacity-50 hover:from-red-900 hover:to-gray-900 transition-all"
            >
              {loading ? 'Saving...' : bankInfo ? 'Update Account' : 'Link Account'}
            </button>
            <button
              onClick={() => bankInfo ? setShowCard(true) : navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {bankInfo ? 'Cancel' : 'Back'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
