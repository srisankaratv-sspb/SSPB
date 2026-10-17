import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sri_sankara_admin_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('sri_sankara_admin_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await adminService.getMe();
        if (res.success && res.user) {
          setAdminUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('[AdminAuthContext] Token validation failed:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await adminService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('sri_sankara_admin_token', res.token);
      setToken(res.token);
      setAdminUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await adminService.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('sri_sankara_admin_token');
      setToken(null);
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: Boolean(adminUser && token),
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
