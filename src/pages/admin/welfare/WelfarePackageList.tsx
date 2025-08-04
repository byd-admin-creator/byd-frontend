import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { Plus, Edit, Trash2, Power, PowerOff, Package, AlertCircle } from 'lucide-react';

interface WelfarePackage {
  id: string;
  name: string;
  level: number;
  amount: number;
  duration_days: number;
  multiplier: number;
  active: boolean;
}

const WelfarePackageList = () => {
  const [packages, setPackages] = useState<WelfarePackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('welfare_packages').select('*').order('level');
      if (error) throw error;
      setPackages(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load welfare packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('welfare_packages')
        .update({ active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setPackages(prev =>
        prev.map(pkg => (pkg.id === id ? { ...pkg, active: !currentStatus } : pkg))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update package status.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this package? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('welfare_packages').delete().eq('id', id);
      if (error) throw error;
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete package.');
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-red-800 p-8">
            <div className="animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-red-800/30 rounded w-48"></div>
                <div className="h-10 bg-red-800/30 rounded w-40"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-red-900/20 rounded border border-red-800/50"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-900/20 rounded-lg border border-red-800">
                <Package className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welfare Packages</h1>
                <p className="text-red-300 mt-1">Manage and configure welfare benefit packages</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/welfare/create')}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg border border-red-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Package
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-600 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto px-3 py-1 text-sm text-red-300 border border-red-600 hover:bg-red-800/50 rounded"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-xl shadow-2xl border border-red-800 overflow-hidden">
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No packages found</h3>
              <p className="text-red-300 mb-6">Get started by creating your first welfare package.</p>
              <button
                onClick={() => navigate('/admin/welfare/create')}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg border border-red-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-red-800">
                <thead className="bg-black">
                  <tr>
                    {['Package Details', 'Level', 'Amount', 'Duration', 'Multiplier', 'Status', 'Actions'].map((title, i) => (
                      <th key={i} className="px-6 py-4 text-center text-xs font-medium text-red-300 uppercase tracking-wider border-b border-red-800">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-red-800/50">
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-red-900/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border border-red-500">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{pkg.name}</div>
                            <div className="text-sm text-red-300">ID: {pkg.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-800 text-red-200 border border-red-600">
                          Level {pkg.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-white font-medium">{formatCurrency(pkg.amount)}</td>
                      <td className="px-6 py-4 text-center text-red-200">{pkg.duration_days} days</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-red-200 border border-red-700">
                          {pkg.multiplier}×
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          pkg.active ? 'bg-green-800 text-green-200 border-green-600' : 'bg-red-800 text-red-200 border-red-600'
                        }`}>
                          {pkg.active ? <><Power className="h-3 w-3 mr-1" /> Active</> : <><PowerOff className="h-3 w-3 mr-1" /> Inactive</>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/welfare/edit/${pkg.id}`)}
                            className="inline-flex items-center px-3 py-1 text-sm text-red-300 border border-red-600 hover:bg-red-800/50 hover:text-white rounded"
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(pkg.id, pkg.active)}
                            className={`inline-flex items-center px-3 py-1 text-sm border rounded ${
                              pkg.active ? 'text-red-300 border-red-600 hover:bg-red-800/50' : 'text-green-300 border-green-600 hover:bg-green-800/50'
                            }`}
                          >
                            {pkg.active ? <><PowerOff className="h-3 w-3 mr-1" /> Deactivate</> : <><Power className="h-3 w-3 mr-1" /> Activate</>}
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="inline-flex items-center px-3 py-1 text-sm text-red-400 border border-red-600 hover:bg-red-700 hover:text-white rounded"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {packages.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-red-300">
            <div>Showing {packages.length} package{packages.length !== 1 ? 's' : ''}</div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2" />
                {packages.filter(p => p.active).length} Active
              </span>
              <span className="flex items-center">
                <div className="h-2 w-2 bg-red-400 rounded-full mr-2" />
                {packages.filter(p => !p.active).length} Inactive
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelfarePackageList;
