import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'
import {
  Home,
  Users,
  DollarSign,
  Settings,
  Bell,
  Shield,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Filter,
  Download
} from 'lucide-react'


// TypeScript Interfaces
interface WithdrawalRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  amount: number
  requested_at: string
  status: string
  bank_name?: string
  account_number?: string
  account_name?: string
}

interface Metrics {
  totalUsers: number
  totalDeposits: number
  pendingWithdrawals: number
  monthlyRevenue: number
}

interface TimeSeriesPoint {
  date: string
  value: number
  secondary?: number
}

interface RecentActivity {
  id: string
  type: 'deposit' | 'withdrawal' | 'signup' | 'referral'
  user: string
  amount?: number
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

interface PieDataPoint {
  name: string
  value: number
  color: string
}


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    monthlyRevenue: 0
  })
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawalRequest[]>([])
  const [userGrowth, setUserGrowth] = useState<TimeSeriesPoint[]>([])
  const [revenueData, setRevenueData] = useState<TimeSeriesPoint[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [pieData, setPieData] = useState<PieDataPoint[]>([])
  const [activeSection, setActiveSection] = useState<'dashboard'|'users'|'funds'|'analytics'|'reports'|'security'|'settings'|'withdrawals'>('dashboard')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. FETCH METRICS
        const [usersCountRes, depositsRes, pendingRes, revRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('deposits').select('amount'),
          supabase.from('withdrawal_requests').select('amount').eq('status', 'pending'),
          supabase.from('transactions')
            .select('amount')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ])

        setMetrics({
          totalUsers: usersCountRes.count ?? 0,
          totalDeposits: depositsRes.data?.reduce((sum, d) => sum + d.amount, 0) ?? 0,
          pendingWithdrawals: pendingRes.data?.reduce((sum, d) => sum + d.amount, 0) ?? 0,
          monthlyRevenue: revRes.data?.reduce((sum, d) => sum + d.amount, 0) ?? 0
        })

        // 2. FETCH WITHDRAWAL REQUESTS + USER & BANK INFO
        const { data: wrData } = await supabase
          .from('withdrawal_requests')
          .select('id,user_id,amount,status,requested_at')
          .eq('status', 'pending')
          .order('requested_at', { ascending: false })

        const userIds = wrData?.map(w => w.user_id) || []
        const [usersInfoRes, bankInfoRes] = await Promise.all([
          supabase.from('users').select('id,username,email').in('id', userIds),
          supabase.from('user_bank_info').select('user_id,bank_name,account_number,account_name').in('user_id', userIds)
        ])

        const enriched = (wrData || []).map(w => {
          const user = usersInfoRes.data?.find(u => u.id === w.user_id)
          const bank = bankInfoRes.data?.find(b => b.user_id === w.user_id)
          return {
            ...w,
            user_name: user?.username || 'Unknown',
            user_email: user?.email || 'Unknown',
            bank_name: bank?.bank_name,
            account_number: bank?.account_number,
            account_name: bank?.account_name
          }
        })
        setWithdrawRequests(enriched)

        // 3. FETCH USER GROWTH (Last 7 Days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const { data: userGrowthData } = await supabase
          .from('users')
          .select('created_at')
          .gte('created_at', sevenDaysAgo.toISOString())

        const growthByDate: Record<string, number> = {}
        userGrowthData?.forEach(u => {
          const date = new Date(u.created_at).toISOString().split('T')[0]
          growthByDate[date] = (growthByDate[date] || 0) + 1
        })
        setUserGrowth(
          Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const dateStr = date.toISOString().split('T')[0]
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: growthByDate[dateStr] || 0
            }
          })
        )

        // 4. FETCH REVENUE DATA (Last 7 Days)
        const { data: revenueRawData } = await supabase
          .from('transactions')
          .select('amount,created_at')
          .gte('created_at', sevenDaysAgo.toISOString())

        const revenueByDate: Record<string, number> = {}
        revenueRawData?.forEach(t => {
          const date = new Date(t.created_at).toISOString().split('T')[0]
          revenueByDate[date] = (revenueByDate[date] || 0) + t.amount
        })

        setRevenueData(
          Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const dateStr = date.toISOString().split('T')[0]
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: revenueByDate[dateStr] || 0
            }
          })
        )

        // 5. FETCH RECENT ACTIVITY
        const [transactionsRes, withdrawalsRes, referralsRes, usersRes] = await Promise.all([
          supabase.from('transactions').select('id,user_id,amount,created_at,status').order('created_at', { ascending: false }).limit(5),
          supabase.from('withdrawal_requests').select('id,user_id,amount,requested_at,status').order('requested_at', { ascending: false }).limit(5),
          supabase.from('referrals').select('id,referrer_id,created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('users').select('id,username,created_at').order('created_at', { ascending: false }).limit(5)
        ])

        const activities: RecentActivity[] = [
          ...(transactionsRes.data || []).map(t => ({
            id: t.id,
            type: 'deposit',
            user: `User ${t.user_id.slice(0, 8)}`,
            amount: t.amount,
            timestamp: t.created_at,
            status: t.status || 'completed'
          })),
          ...(withdrawalsRes.data || []).map(w => ({
            id: w.id,
            type: 'withdrawal',
            user: `User ${w.user_id.slice(0, 8)}`,
            amount: w.amount,
            timestamp: w.requested_at,
            status: w.status || 'pending'
          })),
          ...(referralsRes.data || []).map(r => ({
            id: r.id,
            type: 'referral',
            user: `User ${r.referrer_id.slice(0, 8)}`,
            timestamp: r.created_at,
            status: 'completed'
          })),
          ...(usersRes.data || []).map(u => ({
            id: u.id,
            type: 'signup',
            user: u.username || `User ${u.id.slice(0, 8)}`,
            timestamp: u.created_at,
            status: 'completed'
          }))
        ]
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setRecentActivity(activities.slice(0, 5))

        // 6. PIE CHART DATA
        setPieData([
          { name: 'Deposits', value: depositsRes.data?.length || 0, color: '#DC2626' },
          { name: 'Withdrawals', value: withdrawalsRes.data?.length || 0, color: '#EF4444' },
          { name: 'Revenue', value: Math.floor((revRes.data?.length || 0) / 2), color: '#F87171' }
        ])
      } catch (error) {
        console.error('Data fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'approved', processed_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setWithdrawRequests(prev => prev.filter(r => r.id !== id))
    else console.error('Approve error:', error)
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'rejected', processed_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setWithdrawRequests(prev => prev.filter(r => r.id !== id))
    else console.error('Reject error:', error)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':   return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':    return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit':    return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'withdrawal': return <ArrowDownRight className="w-4 h-4 text-red-400" />
      case 'signup':     return <Users className="w-4 h-4 text-blue-400" />
      case 'referral':   return <Users className="w-4 h-4 text-purple-400" />
      default:           return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-red-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-16 w-16 border-b-2 border-red-400 rounded-full" />
          <p className="text-red-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-red-900 to-black">
      {/* Sidebar */}
      <div className="w-64 bg-black/30 backdrop-blur-xl border-r border-red-500/20">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-8">Admin Portal</h2>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Home,        label: 'Dashboard' },
              { id: 'users',     icon: Users,       label: 'Users' },
              { id: 'security',  icon: Shield,      label: 'Security' },
              { id: 'settings',  icon: Settings,    label: 'Settings' },
              { id: 'withdrawals',icon: DollarSign,label: 'Pending Withdrawals' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-red-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all">
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
              <div className="flex items-center space-x-2">
                <Bell className="w-6 h-6 text-gray-400 hover:text-red-400 cursor-pointer" />
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <span className="text-red-400 font-bold">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Dashboard View */}
          {activeSection === 'dashboard' && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[{
                  icon: Users,
                  label: 'Total Users',
                  value: metrics.totalUsers.toLocaleString(),
                  change: '+12.5%',
                  positive: true
                },{
                  icon: DollarSign,
                  label: 'Total Deposits',
                  value: formatCurrency(metrics.totalDeposits),
                  change: '+8.2%',
                  positive: true
                },{
                  icon: Clock,
                  label: 'Pending Withdrawals',
                  value: formatCurrency(metrics.pendingWithdrawals),
                  change: '-3.1%',
                  positive: false
                },{
                  icon: TrendingUp,
                  label: 'Monthly Revenue',
                  value: formatCurrency(metrics.monthlyRevenue),
                  change: '+15.3%',
                  positive: true
                }].map((metric, idx) => (
                  <div key={idx} className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-red-500/20 rounded-lg">
                        <metric.icon className="w-6 h-6 text-red-400" />
                      </div>
                      <div className={`flex items-center space-x-1 ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.positive ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <p className="text-gray-400 text-sm">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth */}
                <div className="lg:col-span-2 bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">User Growth</h3>
                    <Filter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={userGrowth}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill:'#9CA3AF', fontSize:12 }}/>
                      <YAxis axisLine={false} tickLine={false} tick={{ fill:'#9CA3AF', fontSize:12 }}/>
                      <Tooltip contentStyle={{
                        backgroundColor:'rgba(0,0,0,0.8)',
                        border:'1px solid rgba(220,38,38,0.3)',
                        borderRadius:'8px',
                        color:'#fff'
                      }}/>
                      <Area type="monotone" dataKey="value" stroke="#DC2626" fillOpacity={1} fill="url(#userGradient)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Transaction Types Pie */}
                <div className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                  <h3 className="text-xl font-bold text-white mb-6">Transaction Types</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{
                        backgroundColor:'rgba(0,0,0,0.8)',
                        border:'1px solid rgba(220,38,38,0.3)',
                        borderRadius:'8px',
                        color:'#fff'
                      }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
                          <span className="text-gray-400 text-sm">{item.name}</span>
                        </div>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Revenue Overview</h3>
                  <Filter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-400" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill:'#9CA3AF', fontSize:12 }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill:'#9CA3AF', fontSize:12 }}/>
                    <Tooltip contentStyle={{
                      backgroundColor:'rgba(0,0,0,0.8)',
                      border:'1px solid rgba(220,38,38,0.3)',
                      borderRadius:'8px',
                      color:'#fff'
                    }}/>
                    <Bar dataKey="value" fill="#DC2626" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                  <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map(act => (
                      <div key={act.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-red-500/10">
                        <div className="flex items-center space-x-3">
                          {getActivityIcon(act.type)}
                          <div>
                            <p className="text-white font-medium">{act.user}</p>
                            <p className="text-gray-400 text-sm capitalize">{act.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {act.amount != null && <p className="text-white font-medium">{formatCurrency(act.amount)}</p>}
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(act.status)}`}>{act.status}</span>
                            <p className="text-gray-400 text-xs">{formatDate(act.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Withdrawals */}
                <div className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
                  <h3 className="text-xl font-bold text-white mb-6">Pending Withdrawals</h3>
                  <div className="space-y-4">
                    {withdrawRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No pending withdrawal requests</p>
                      </div>
                    ) : (
                      withdrawRequests.map(req => (
                        <div key={req.id} className="p-4 bg-black/20 rounded-lg border border-red-500/10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-white font-medium">{req.user_name}</p>
                              <p className="text-gray-400 text-sm">{req.user_email}</p>
                              {req.bank_name && (
                                <p className="text-gray-400 text-xs mt-1">
                                  {req.bank_name} – {req.account_number}
                                </p>
                              )}
                            </div>
                            <p className="text-red-400 font-bold">{formatCurrency(req.amount)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-xs">{formatDate(req.requested_at)}</p>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-1 rounded border border-green-500/30 hover:bg-green-500/30 transition-all"
                              >
                                <Check className="w-3 h-3" /><span className="text-xs">Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/30 transition-all"
                              >
                                <X className="w-3 h-3" /><span className="text-xs">Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Withdrawals Full Page */}
          {activeSection === 'withdrawals' && (
            <div className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
              <h3 className="text-xl font-bold text-white mb-6">Pending Withdrawals</h3>
              <div className="space-y-4">
                {withdrawRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No pending withdrawal requests</p>
                  </div>
                ) : (
                  withdrawRequests.map(req => (
                    <div key={req.id} className="p-4 bg-black/20 rounded-lg border border-red-500/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-medium">{req.user_name}</p>
                          <p className="text-gray-400 text-sm">{req.user_email}</p>
                          {req.bank_name && (
                            <p className="text-gray-400 text-xs mt-1">
                              {req.bank_name} – {req.account_number}
                            </p>
                          )}
                        </div>
                        <p className="text-red-400 font-bold">{formatCurrency(req.amount)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs">{formatDate(req.requested_at)}</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-1 rounded border border-green-500/30 hover:bg-green-500/30 transition-all"
                          >
                            <Check className="w-3 h-3" /><span className="text-xs">Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/30 transition-all"
                          >
                            <X className="w-3 h-3" /><span className="text-xs">Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
