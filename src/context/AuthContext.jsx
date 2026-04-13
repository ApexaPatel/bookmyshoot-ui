import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext({});

/** Normalize backend user to { id, name, email, bio, avatar, cover, role } for consistent UI use */
function normalizeUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id ?? apiUser._id ?? null,
    name: apiUser.full_name ?? apiUser.name,
    email: apiUser.email,
    bio: apiUser.bio ?? '',
    avatar: apiUser.profile_picture ?? null,
    cover: apiUser.cover_image ?? null,
    role: apiUser.role ?? 'customer',
    isMember: Boolean(apiUser.is_member),
    membershipStart: apiUser.membership_start ?? null,
    membershipExpiry: apiUser.membership_expiry ?? null,
    photographerPlan: apiUser.photographer_plan ?? 'free',
    planStartedAt: apiUser.plan_started_at ?? null,
    planExpiresAt: apiUser.plan_expires_at ?? null,
  };
}

export const AuthProvider = ({ children }) => {
  const { user, token, isAuthenticated, login: authLogin, logout: authLogout, updateUser, setUser } = useAuthStore();
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

  const updateProfileImage = async (profilePictureUrl) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/auth/profile-image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_picture: profilePictureUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update profile image');
    }
    const data = await res.json();
    updateUser({ avatar: data.profile_picture ?? profilePictureUrl });
  };

  const updateCoverImage = async (coverImageUrl) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/users/cover-image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cover_image: coverImageUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data.detail ?? 'Failed to update cover image';
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg ?? detail : String(detail);
      throw new Error(msg);
    }
    updateUser({ cover: data.cover_image ?? coverImageUrl });
  };

  const refreshUser = async () => {
    const t = useAuthStore.getState().token;
    if (!t) return;
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) return;
    const me = await res.json();
    setUser(normalizeUser(me));
  };

  const updateBio = async (bio) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/users/bio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data.detail ?? 'Failed to update bio';
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg ?? detail : String(detail);
      throw new Error(msg);
    }
    updateUser({ bio: data.bio ?? bio });
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
    updateProfileImage,
    updateCoverImage,
    updateBio,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
