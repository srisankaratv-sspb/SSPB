import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import ProductsPage from '../pages/ProductsPage';
import CustomersPage from '../pages/CustomersPage';
import PaymentsPage from '../pages/PaymentsPage';
import RefundsPage from '../pages/RefundsPage';
import ContentPage from '../pages/ContentPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import UsersPage from '../pages/UsersPage';
import SettingsPage from '../pages/SettingsPage';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public Admin Auth Route */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="refunds" element={<RefundsPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
