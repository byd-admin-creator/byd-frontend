import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

const EditPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    amount: '',
    duration: '',
    multiplier: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPackage = async () => {
      const { data, error } = await supabase
        .from('welfare_packages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Failed to load package: ' + error.message);
        navigate('/admin/welfare');
      } else {
        setForm({
          name: data.name || '',
          amount: data.amount?.toString() || '',
          duration: data.duration?.toString() || '',
          multiplier: data.multiplier?.toString() || '',
        });
      }
    };

    loadPackage();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('welfare_packages')
      .update({
        name: form.name,
        amount: parseFloat(form.amount),
        duration: parseInt(form.duration),
        multiplier: parseFloat(form.multiplier),
      })
      .eq('id', id);

    setLoading(false);

    if (error) {
      alert('Error updating package: ' + error.message);
    } else {
      alert('Package updated successfully');
      navigate('/admin/welfare');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Edit Welfare Package</h1>
          <p className="text-gray-300 mt-1">Package ID: {id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Package Details</h2>
              <p className="text-gray-600 mt-1">Update the welfare package information below</p>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter package name"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Days)
                </label>
                <input
                  name="duration"
                  type="number"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter duration in days"
                  required
                />
              </div>

              {/* Multiplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multiplier
                </label>
                <input
                  name="multiplier"
                  type="number"
                  step="0.1"
                  value={form.multiplier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="1.5"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/welfare')}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Important Note</h3>
              <p className="text-sm text-red-700 mt-1">
                Changes to welfare packages will affect all future distributions. Please review carefully before saving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPackage;
