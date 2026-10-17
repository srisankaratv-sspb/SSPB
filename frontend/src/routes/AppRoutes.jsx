import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/templates/PublicLayout';
import AdminLayout from '../components/templates/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';

// Public Pages
import HomePage from '../pages/HomePage';
import PaymentResultPage from '../pages/PaymentResultPage';
import OrderStatusPage from '../pages/OrderStatusPage';
import ProfilePage from '../pages/ProfilePage';

// Admin Pages
import AdminLoginPage from '../pages/AdminLoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import OrdersPage from '../pages/admin/OrdersPage';
import OrderDetailsPage from '../pages/admin/OrderDetailsPage';
import ProductsPage from '../pages/admin/ProductsPage';
import PaymentsPage from '../pages/admin/PaymentsPage';
import CustomersPage from '../pages/admin/CustomersPage';
import EmailLogsPage from '../pages/admin/EmailLogsPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F8F9FA' }}>
        <p style={{ color: '#64748B' }}>Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/payment-result"
        element={
          <PublicLayout>
            <PaymentResultPage />
          </PublicLayout>
        }
      />
      <Route
        path="/orders/track"
        element={
          <PublicLayout>
            <OrderStatusPage />
          </PublicLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <PublicLayout>
            <ProfilePage />
          </PublicLayout>
        }
      />
      <Route
        path="/my-orders"
        element={
          <PublicLayout>
            <ProfilePage />
          </PublicLayout>
        }
      />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="email-logs" element={<EmailLogsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
