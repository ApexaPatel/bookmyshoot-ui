import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext({});

/** Normalize backend user to { id, name, email, avatar, role } for consistent UI use */
function normalizeUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    name: apiUser.full_name ?? apiUser.name,
    email: apiUser.email,
    avatar: apiUser.profile_picture ?? null,
    role: apiUser.role ?? 'customer',
  };
}

export const AuthProvider = ({ children }) => {
  const { user, token, isAuthenticated, login: authLogin, logout: authLogout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const savedToken = stored?.state?.token;
        if (savedToken) {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const me = await res.json();
            authLogin(normalizeUser(me), savedToken);
          } else {
            authLogout();
          }
        }
      } catch {
        authLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [authLogin, authLogout]);

  const login = async (email, password) => {
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
    authLogin(normalizeUser(data.user), data.access_token);
    navigate('/photographers');
  };

  const logout = () => {
    authLogout();
    navigate('/');
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
