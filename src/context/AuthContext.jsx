import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, initializeAuth, login: authLogin, logout: authLogout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      // Backend uses OAuth2PasswordRequestForm: form-urlencoded with username (email) and password
      const body = new URLSearchParams({ username: email, password });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || (Array.isArray(err.detail) ? err.detail[0]?.msg : 'Login failed'));
      }

      const data = await response.json();
      // Backend returns access_token and user (not token)
      authLogin(data.user, data.access_token);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
