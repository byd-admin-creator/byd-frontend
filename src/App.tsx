import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InvestPage from './pages/Invest';
import About from './pages/About';
import Account from './pages/Account';
import WithdrawPage from './pages/withdraw';
import ResetRequest from './pages/ResetRequest';
import ResetConfirm from './pages/ResetConfirm';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingWithdrawals from './components/admin/PendingWithdrawals';
import DepositPage from './pages/deposit/Deposit';
import DepositSuccess from './pages/DepositSuccess';

import CreatePackage from './pages/admin/welfare/CreatePackage'
import EditPackage from './pages/admin/welfare/EditPackage'
import WelfarePackageList from './pages/admin/welfare/WelfarePackageList';
import ActivationHistory from './pages/admin/welfare/ActivationHistory';
import WelfarePayoutHistory from './pages/admin/welfare/WelfarePayoutHistory';

import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerSupport from './pages/CustomerSupport';
import TransactionHistory from './pages/TransactionHistory';
import BindAccountPage from './pages/BindAccount';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes without bottom nav */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-request" element={<ResetRequest />} />
        <Route path="/reset-confirm" element={<ResetConfirm />} />

        {/* Admin section */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <AdminProtectedRoute>
              <PendingWithdrawals />
            </AdminProtectedRoute>
          }
        />
        <Route
  path="/admin/welfare"
  element={
    <AdminProtectedRoute>
      <WelfarePackageList />
    </AdminProtectedRoute>
  }
/>
<Route
  path="/admin/welfare/create"
  element={
    <AdminProtectedRoute>
      <CreatePackage />
    </AdminProtectedRoute>
  }
/>
<Route
  path="/admin/welfare/edit/:id"
  element={
    <AdminProtectedRoute>
      <EditPackage />
    </AdminProtectedRoute>
  }
/>
<Route
  path="/admin/welfare/activations"
  element={
    <AdminProtectedRoute>
      <ActivationHistory />
    </AdminProtectedRoute>
  }
/>
<Route path="/admin/welfare/payouts"
 element={
   <AdminProtectedRoute>
    <WelfarePayoutHistory />
    </AdminProtectedRoute>
    }
/>




       

        {/* User Protected Routes with Bottom Nav Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invest" element={<InvestPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/account" element={<Account />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/account/customer-support" element={<CustomerSupport />} />
          <Route path="/account/transaction-history" element={<TransactionHistory />} />
          <Route path="/account/reset-password" element={<ResetRequest />} />
          <Route path="/account/bind-account" element={<BindAccountPage />} />
          <Route path="/deposit/success" element={<DepositSuccess />} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
