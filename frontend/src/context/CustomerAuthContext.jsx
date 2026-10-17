import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAuthService } from '../services/customerAuthService';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sri_sankara_customer_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('sri_sankara_customer_token');
      if (storedToken) {
        try {
          const res = await customerAuthService.getMe();
          if (res.success && res.customer) {
            setCustomer(res.customer);
            setToken(storedToken);
          } else {
            localStorage.removeItem('sri_sankara_customer_token');
            setCustomer(null);
            setToken(null);
          }
        } catch (err) {
          console.warn('[CustomerAuth] Session expired or invalid:', err.message);
          localStorage.removeItem('sri_sankara_customer_token');
          setCustomer(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async ({ identifier, password }) => {
    const res = await customerAuthService.login({ identifier, password });
    if (res.success && res.token && res.customer) {
      localStorage.setItem('sri_sankara_customer_token', res.token);
      setCustomer(res.customer);
      setToken(res.token);
      setAuthModalOpen(false);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async ({ name, email, phone, password }) => {
    const res = await customerAuthService.register({ name, email, phone, password });
    if (res.success && res.token && res.customer) {
      localStorage.setItem('sri_sankara_customer_token', res.token);
      setCustomer(res.customer);
      setToken(res.token);
      setAuthModalOpen(false);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await customerAuthService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('sri_sankara_customer_token');
    setCustomer(null);
    setToken(null);
    setMyOrdersModalOpen(false);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openMyOrdersModal = () => {
    setMyOrdersModalOpen(true);
  };

  const closeMyOrdersModal = () => {
    setMyOrdersModalOpen(false);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!customer,
        isLoading,
        authModalOpen,
        authModalMode,
        myOrdersModalOpen,
        openAuthModal,
        closeAuthModal,
        openMyOrdersModal,
        closeMyOrdersModal,
        login,
        register,
        logout
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

export default CustomerAuthContext;
