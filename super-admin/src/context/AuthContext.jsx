import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sri_sankara_superadmin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('sri_sankara_superadmin_token');
      if (!storedToken) {
        setLoading(false);
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
        console.warn('[SuperAdmin Auth] Session invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await adminService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('sri_sankara_superadmin_token', res.token);
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
      localStorage.removeItem('sri_sankara_superadmin_token');
      setToken(null);
      setAdminUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: Boolean(adminUser && token),
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
