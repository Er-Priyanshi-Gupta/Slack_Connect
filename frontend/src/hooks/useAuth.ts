import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/utils/constants';
import { authAPI } from '@/services/api';
import type { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const teamName = urlParams.get('team');
    const error = urlParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      setLoading(false);
      return;
    }

    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData: User = {
          userId: payload.userId,
          teamId: payload.teamId,
          teamName,
        };
        
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        setUser(userData);
        
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    } else {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      }
    }
    
    setLoading(false);
  }, []);

  const login = () => {
    authAPI.initiateSlackAuth();
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
