import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import DashboardLayout from './components/DashboardLayout';
import SkyEliteHero from './pages/landing/SkyEliteHero';
import CargoLanding from './pages/landing/CargoLanding';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import LogisticsContainers from './pages/logistics/LogisticsContainers';
import LogisticsBookings from './pages/logistics/LogisticsBookings';
import LogisticsPayments from './pages/logistics/LogisticsPayments';
import LogisticsInvoices from './pages/logistics/LogisticsInvoices';
import LogisticsMessages from './pages/logistics/LogisticsMessages';
import LogisticsAnalytics from './pages/logistics/LogisticsAnalytics';
import LogisticsSettings from './pages/logistics/LogisticsSettings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerSearch from './pages/customer/CustomerSearch';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerTracking from './pages/customer/CustomerTracking';
import CustomerPayments from './pages/customer/CustomerPayments';
import CustomerDocuments from './pages/customer/CustomerDocuments';
import CustomerInvoices from './pages/customer/CustomerInvoices';
import CustomerMessages from './pages/customer/CustomerMessages';
import CustomerReviews from './pages/customer/CustomerReviews';
import CustomerSupport from './pages/customer/CustomerSupport';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { getMe } from './features/authSlice';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, token } = useAppSelector((state: any) => state.auth);
  if (!token) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [token, dispatch]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<CargoLanding />} />
        <Route path="/skyelite" element={<SkyEliteHero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="containers" element={<AdminBookings />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        <Route path="/logistics" element={<ProtectedRoute roles={['logistics']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<LogisticsDashboard />} />
          <Route path="containers" element={<LogisticsContainers />} />
          <Route path="bookings" element={<LogisticsBookings />} />
          <Route path="payments" element={<LogisticsPayments />} />
          <Route path="invoices" element={<LogisticsInvoices />} />
          <Route path="messages" element={<LogisticsMessages />} />
          <Route path="analytics" element={<LogisticsAnalytics />} />
          <Route path="settings" element={<LogisticsSettings />} />
        </Route>

        <Route path="/customer" element={<ProtectedRoute roles={['customer']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="search" element={<CustomerSearch />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="tracking" element={<CustomerTracking />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="documents" element={<CustomerDocuments />} />
          <Route path="invoices" element={<CustomerInvoices />} />
          <Route path="messages" element={<CustomerMessages />} />
          <Route path="reviews" element={<CustomerReviews />} />
          <Route path="support" element={<CustomerSupport />} />
        </Route>
      </Routes>
    </Router>
  );
}
