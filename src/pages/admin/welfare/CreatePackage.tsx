import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

const CreatePackage = () => {
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    amount: '',
    duration: '',
    multiplier: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('welfare_packages').insert([
      {
        name: formData.name,
        level: parseInt(formData.level),
        amount: parseFloat(formData.amount),
        duration: parseInt(formData.duration),
        multiplier: parseFloat(formData.multiplier),
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Error creating package: ' + error.message);
    } else {
      alert('Package created successfully');
      navigate('/admin/welfare');
    }
  };

  const handleCancel = () => {
    navigate('/admin/welfare');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Welfare Package</h1>
          <p className="text-gray-400">Fill in the details below to create a new welfare package</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg shadow-2xl p-8 border border-gray-800">
          <div className="space-y-6">
            {/* Package Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Package Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg"
                placeholder="Enter package name"
                required
              />
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-2">
                Level
              </label>
              <input
                type="number"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg"
                placeholder="Enter level (e.g., 1)"
                min="1"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-gray-600 text-white pl-8 pr-4 py-3 rounded-lg"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg"
                placeholder="Enter duration in days"
                min="1"
                required
              />
            </div>

            {/* Multiplier */}
            <div>
              <label htmlFor="multiplier" className="block text-sm font-medium text-gray-300 mb-2">
                Multiplier
              </label>
              <input
                type="number"
                id="multiplier"
                name="multiplier"
                value={formData.multiplier}
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg"
                placeholder="e.g. 1.5"
                step="0.1"
                min="0.1"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                {loading ? 'Creating...' : 'Create Package'}
              </button>
            </div>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">Package Guidelines</h3>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>• Package names should be descriptive and unique</p>
            <p>• Level must be numeric and sequential (e.g. 1, 2, 3...)</p>
            <p>• Amount represents the base welfare amount in your currency</p>
            <p>• Duration is the number of days the package remains active</p>
            <p>• Multiplier adjusts the final payout (e.g., 1.5 = 150% of base amount)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePackage;
