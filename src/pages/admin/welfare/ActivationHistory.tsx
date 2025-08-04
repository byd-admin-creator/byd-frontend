import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface Activation {
  id: string;
  user_id: string;
  package_id: string;
  activated_at: string;
  user: {
    username: string;
    email: string;
  };
  package: {
    name: string;
    amount: number;
    duration: number;
    multiplier: number;
  };
}

const ActivationHistory = () => {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivation, setSelectedActivation] = useState<Activation | null>(null);

  useEffect(() => {
    const fetchActivations = async () => {
      const { data, error } = await supabase
  .from('welfare_fund_investments')
  .select(`
    id,
    user_id,
    welfare_package_id,
    activated_at,
    user:user_id(username,email),
    package:welfare_fund_investments_welfare_package_id_fkey(name,amount,duration,multiplier)
  `)
  .order('activated_at', { ascending: false });

        

      if (error) {
        console.error('Failed to fetch activations:', error.message);
      } else {
        // Cast each user and package from array to object
        const formatted = (data || []).map((a: any) => ({
          ...a,
          user: Array.isArray(a.user) ? a.user[0] : a.user,
          package: Array.isArray(a.package) ? a.package[0] : a.package,
        })) as Activation[];

        setActivations(formatted);
      }

      setLoading(false);
    };

    fetchActivations();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      <h1 className="text-2xl font-bold mb-4">Welfare Activation History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : activations.length === 0 ? (
        <p>No activations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
            <thead>
              <tr className="text-left text-gray-400 text-sm uppercase bg-gray-800">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Package</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Multiplier</th>
                <th className="px-4 py-2">Activated At</th>
              </tr>
            </thead>
            <tbody>
              {activations.map((activation) => (
                <tr
                  key={activation.id}
                  className="border-t border-gray-700 cursor-pointer hover:bg-gray-800"
                  onClick={() => setSelectedActivation(activation)}
                >
                  <td className="px-4 py-2">{activation.user?.username || activation.user_id}</td>
                  <td className="px-4 py-2">{activation.user?.email || '-'}</td>
                  <td className="px-4 py-2">{activation.package?.name || 'N/A'}</td>
                  <td className="px-4 py-2">${activation.package?.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">{activation.package?.duration} days</td>
                  <td className="px-4 py-2">{activation.package?.multiplier}×</td>
                  <td className="px-4 py-2">{new Date(activation.activated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {selectedActivation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-[90%] md:w-[600px] shadow-xl border border-red-600 relative">
            <button
              onClick={() => setSelectedActivation(null)}
              className="absolute top-2 right-3 text-gray-300 hover:text-white text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-red-500 mb-4">Activation Details</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Username:</span> {selectedActivation.user.username}</p>
              <p><span className="font-semibold">Email:</span> {selectedActivation.user.email}</p>
              <p><span className="font-semibold">Package:</span> {selectedActivation.package.name}</p>
              <p><span className="font-semibold">Amount:</span> ${selectedActivation.package.amount.toFixed(2)}</p>
              <p><span className="font-semibold">Duration:</span> {selectedActivation.package.duration} days</p>
              <p><span className="font-semibold">Multiplier:</span> {selectedActivation.package.multiplier}×</p>
              <p><span className="font-semibold">Activated At:</span> {new Date(selectedActivation.activated_at).toLocaleString()}</p>
              <p><span className="font-semibold">Activation ID:</span> {selectedActivation.id}</p>
              <p><span className="font-semibold">User ID:</span> {selectedActivation.user_id}</p>
              <p><span className="font-semibold">Package ID:</span> {selectedActivation.package_id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivationHistory;
