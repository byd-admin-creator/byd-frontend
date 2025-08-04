import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DollarSign, Check, X, User, Calendar, CreditCard, Loader2 } from 'lucide-react';

// TypeScript Interfaces
interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  requested_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface BankInfo {
  user_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface PendingRequest {
  id: string;
  user_id: string;
  username: string;
  email: string;
  amount: number;
  requested_at: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

const PendingWithdrawals: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Fetch all pending withdrawal data
  const fetchPendingWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch pending withdrawal requests
      const { data: withdrawalRequests, error: wrError } = await supabase
        .from('withdrawal_requests')
        .select('id,user_id,net_amount,status,requested_at')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (wrError) {
        console.error('Error fetching withdrawal requests:', wrError);
        throw new Error('Failed to fetch withdrawal requests');
      }

      if (!withdrawalRequests || withdrawalRequests.length === 0) {
        setPendingRequests([]);
        return;
      }

      const userIds = withdrawalRequests.map(wr => wr.user_id);

      // 2. Fetch user info
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id,username,email')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error('Failed to fetch user information');
      }

      // 3. Fetch bank info
      const { data: bankInfo, error: bankError } = await supabase
        .from('user_bank_info')
        .select('user_id,bank_name,account_number,account_name')
        .in('user_id', userIds);

      if (bankError) {
        console.error('Error fetching bank info:', bankError);
        throw new Error('Failed to fetch bank information');
      }

      // 4. Merge data into single array
      const mergedData: PendingRequest[] = withdrawalRequests.map(wr => {
        const user = users?.find(u => u.id === wr.user_id);
        const bank = bankInfo?.find(b => b.user_id === wr.user_id);

        return {
          id: wr.id,
          user_id: wr.user_id,
          username: user?.username || 'Unknown User',
          email: user?.email || 'No Email',
          amount: wr.net_amount,
          requested_at: wr.requested_at,
          bank_name: bank?.bank_name || 'No Bank Info',
          account_number: bank?.account_number || 'N/A',
          account_name: bank?.account_name || 'N/A'
        };
      });

      setPendingRequests(mergedData);
    } catch (err) {
      console.error('Error in fetchPendingWithdrawals:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle approval
  const handleApprove = async (id: string) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));

      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'approved', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error approving withdrawal:', error);
        throw new Error('Failed to approve withdrawal request');
      }

      // Remove from state
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      console.log(`Withdrawal request ${id} approved successfully`);
    } catch (err) {
      console.error('Error in handleApprove:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Handle rejection
  const handleReject = async (id: string) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));

      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'rejected', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error rejecting withdrawal:', error);
        throw new Error('Failed to reject withdrawal request');
      }

      // Remove from state
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      console.log(`Withdrawal request ${id} rejected successfully`);
    } catch (err) {
      console.error('Error in handleReject:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Load data on component mount
  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <p className="text-gray-300">Loading pending withdrawals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <DollarSign className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-white">Pending Withdrawals</h1>
        </div>
        <p className="text-gray-400">
          Review and process withdrawal requests from users
        </p>
        {pendingRequests.length > 0 && (
          <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg inline-block">
            <span className="text-red-400 font-medium">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchPendingWithdrawals}
            className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      {pendingRequests.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-xl p-8 text-center">
          <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Pending Withdrawals
          </h3>
          <p className="text-gray-400">
            All withdrawal requests have been processed.
          </p>
          <button
            onClick={fetchPendingWithdrawals}
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-500/10 border-b border-red-500/20">
                  <tr>
                    <th className="text-left p-4 text-red-400 font-semibold">User</th>
                    <th className="text-left p-4 text-red-400 font-semibold">Amount</th>
                    <th className="text-left p-4 text-red-400 font-semibold">Requested</th>
                    <th className="text-left p-4 text-red-400 font-semibold">Bank Details</th>
                    <th className="text-center p-4 text-red-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b border-red-500/10 hover:bg-red-500/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{request.username}</p>
                            <p className="text-sm text-gray-400">{request.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-400 text-lg">
                          {formatCurrency(request.amount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(request.requested_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-red-400" />
                            <span className="font-medium">{request.bank_name}</span>
                          </div>
                          <p className="text-sm text-gray-400">{request.account_name}</p>
                          <p className="text-sm text-gray-500 font-mono">{request.account_number}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-xl p-6">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{request.username}</p>
                    <p className="text-sm text-gray-400">{request.email}</p>
                    <p className="text-sm text-gray-500">{request.account_name}</p>
                  </div>
                </div>

                {/* Amount and Date */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Amount</p>
                    <p className="font-bold text-green-400 text-xl">{formatCurrency(request.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Requested</p>
                    <p className="text-sm text-gray-300">{formatDate(request.requested_at)}</p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-white">{request.bank_name}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{request.account_name}</p>
                  <p className="text-sm text-gray-400 font-mono">{request.account_number}</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processingIds.has(request.id)}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    {processingIds.has(request.id) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processingIds.has(request.id)}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    {processingIds.has(request.id) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingWithdrawals;