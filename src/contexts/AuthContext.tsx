'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSocket } from '@/lib/socket';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'client';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

const TOKEN_KEY = 'token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 ngày

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Kiểm tra token có hết hạn không
  const isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return parseInt(expiry) < Date.now();
  };

  // Lấy user từ token
  const fetchCurrentUser = async (token: string) => {
    try {
      const socket = getSocket();
      
      // Timeout sau 5 giây
      const timeout = setTimeout(() => {
        console.error('Fetch user timeout');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setIsLoading(false);
      }, 5000);

      socket.emit('get-current-user', { token }, (res: any) => {
        clearTimeout(timeout);
        
        if (res.success) {
          setUser(res.data);
        } else {
          console.error('Token invalid:', res.error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setIsLoading(false);
    }
  };

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && !isTokenExpired()) {
      fetchCurrentUser(token);
    } else {
      if (token) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      }
      setIsLoading(false);
    }
  }, []);

  // Auto logout khi token hết hạn
  useEffect(() => {
    if (!user) return;

    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry) {
      const timeLeft = parseInt(expiry) - Date.now();
      if (timeLeft <= 0) {
        logout();
      } else {
        const timer = setTimeout(() => {
          logout();
        }, timeLeft);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Redirect based on role
  useEffect(() => {
    if (!isLoading && user) {
      const isAdminRoute = pathname?.startsWith('/admin');
      const isClientRoute = pathname?.startsWith('/client');
      const isAuthRoute = pathname?.startsWith('/auth');
      
      if (isAuthRoute) {
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/client');
        }
      } else if (user.role === 'admin' && !isAdminRoute) {
        router.push('/admin');
      } else if (user.role === 'client' && !isClientRoute) {
        router.push('/client');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      const socket = getSocket();
      socket.emit('login', { username, password }, (res: any) => {
        if (res.success) {
          // Lưu token và thời gian hết hạn
          localStorage.setItem(TOKEN_KEY, res.data.token);
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + TOKEN_DURATION));
          setUser(res.data.user);
          resolve();
        } else {
          reject(new Error(res.error));
        }
      });
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setUser(null);
    router.push('/auth/login');
  };

  const register = async (data: RegisterData) => {
    return new Promise<void>((resolve, reject) => {
      const socket = getSocket();
      socket.emit('register', data, (res: any) => {
        if (res.success) {
          localStorage.setItem(TOKEN_KEY, res.data.token);
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + TOKEN_DURATION));
          setUser(res.data.user);
          resolve();
        } else {
          reject(new Error(res.error));
        }
      });
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
