import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { AuthModal } from './components/organisms/AuthModal';
import { MyOrdersModal } from './components/organisms/MyOrdersModal';
import AppRoutes from './routes/AppRoutes';

export const App = () => {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <AppRoutes />
          <AuthModal />
          <MyOrdersModal />
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

export default App;
