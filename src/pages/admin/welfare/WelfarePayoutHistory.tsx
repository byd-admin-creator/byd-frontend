// src/pages/admin/welfare/Payout.tsx

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

// --- Type definitions ---
interface User {
  id: number;
  email: string;
}

interface WelfarePackage {
  level: number;
  name: string;
}

// Supabase returns arrays for nested relationships
interface SupabaseWelfareFundInvestment {
  user_id: number;
  welfare_package_id: number;
  users: User[];
  welfare_packages: WelfarePackage[];
}

// Our processed interface for easier use
interface WelfareFundInvestment {
  user_id: number;
  welfare_package_id: number;
  users?: User;
  welfare_packages?: WelfarePackage;
}

// Raw response from Supabase
interface SupabasePayout {
  id: number;
  payout_amount: number;
  payout_multiplier: number;
  payout_round: number;
  triggered_by: string;
  created_at: string;
  welfare_fund_investments: SupabaseWelfareFundInvestment[];
}

// Processed payout for our UI
export interface Payout {
  id: number;
  payout_amount: number;
  payout_multiplier: number;
  payout_round: number;
  triggered_by: string;
  created_at: string;
  welfare_fund_investments?: WelfareFundInvestment;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface TableHeadProps {
  children: React.ReactNode;
}

interface LevelData {
  level: number;
}

// --- Main Component ---
export default function WelfarePayoutHistory() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterTrigger, setFilterTrigger] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [filterLevel, filterTrigger, searchUser, dateRange]);

  async function fetchLevels() {
    try {
      const { data, error } = await supabase
        .from('welfare_packages')
        .select('level')
        .order('level');

      if (!error && data) {
        setLevels(data as LevelData[]);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  }

  async function fetchPayouts() {
    setLoading(true);

    try {
      let query = supabase
        .from('welfare_fund_payouts')
        .select(`
          id,
          payout_amount,
          payout_multiplier,
          payout_round,
          triggered_by,
          created_at,
          welfare_fund_investments (
            user_id,
            welfare_package_id,
            users: user_id (id, email),
            welfare_packages: welfare_package_id (level, name)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters conditionally
      if (filterTrigger) {
        query = query.eq('triggered_by', filterTrigger);
      }

      if (searchUser) {
        query = query.ilike('welfare_fund_investments.users.email', `%${searchUser}%`);
      }

      if (filterLevel) {
        query = query.eq('welfare_fund_investments.welfare_packages.level', filterLevel);
      }

      if (dateRange.from && dateRange.to) {
        query = query.gte('created_at', dateRange.from).lte('created_at', dateRange.to);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        // Transform Supabase response to our expected format
        const transformedPayouts: Payout[] = (data as SupabasePayout[]).map(payout => ({
          ...payout,
          welfare_fund_investments: payout.welfare_fund_investments[0] ? {
            user_id: payout.welfare_fund_investments[0].user_id,
            welfare_package_id: payout.welfare_fund_investments[0].welfare_package_id,
            users: payout.welfare_fund_investments[0].users[0],
            welfare_packages: payout.welfare_fund_investments[0].welfare_packages[0]
          } : undefined
        }));
        
        setPayouts(transformedPayouts);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  }

  // Stats
  const totalPayouts = payouts.length;
  const totalAmount = payouts.reduce((sum, p) => sum + p.payout_amount, 0);
  const avgMultiplier = totalPayouts > 0
    ? payouts.reduce((sum, p) => sum + p.payout_multiplier, 0) / totalPayouts
    : 0;
  const latestRound = totalPayouts > 0
    ? Math.max(...payouts.map(p => p.payout_round))
    : 0;

  // Formatters
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welfare Payout History</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and monitor all welfare fund distributions
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Payouts" value={totalPayouts} icon={<Users className="h-6 w-6" />} color="blue" />
          <StatCard title="Total Amount" value={formatCurrency(totalAmount)} icon={<DollarSign className="h-6 w-6" />} color="green" />
          <StatCard title="Avg Multiplier" value={`${avgMultiplier.toFixed(1)}×`} icon={<TrendingUp className="h-6 w-6" />} color="purple" />
          <StatCard title="Latest Round" value={latestRound} icon={<Clock className="h-6 w-6" />} color="orange" />
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl.level} value={String(lvl.level)}>
                  Level {lvl.level}
                </option>
              ))}
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterTrigger}
              onChange={(e) => setFilterTrigger(e.target.value)}
            >
              <option value="">All Triggers</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
            </select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Payout Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payout Records</h3>
            <p className="text-sm text-gray-500">
              Showing {payouts.length} records
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHead>User</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Date</TableHead>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {p.welfare_fund_investments?.users?.email?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {p.welfare_fund_investments?.users?.email ?? '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Level {p.welfare_fund_investments?.welfare_packages?.level ?? '-'}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {p.welfare_fund_investments?.welfare_packages?.name ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(p.payout_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {p.payout_multiplier}×
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{p.payout_round}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        p.triggered_by === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.triggered_by}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payouts.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No payouts found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
const TableHead: React.FC<TableHeadProps> = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorMap: Record<StatCardProps['color'], string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};