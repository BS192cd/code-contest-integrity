import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Auth check successful:', data.data);
        setAuthState({ 
          user: data.data, 
          loading: false, 
          error: null 
        });
      } else {
        console.log('Auth check failed:', response.status);
        localStorage.removeItem('auth_token');
        setAuthState({ 
          user: null, 
          loading: false, 
          error: 'Authentication failed' 
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({ 
        user: null, 
        loading: false, 
        error: 'Network error' 
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.data.token);
        setAuthState({ 
          user: data.data.user, 
          loading: false, 
          error: null 
        });
        return { success: true };
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.error || 'Login failed' 
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error during login';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({ user: null, loading: false, error: null });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    checkAuthStatus
  };
}
