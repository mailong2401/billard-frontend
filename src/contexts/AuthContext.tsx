'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSocket } from '@/lib/socket';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
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

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Redirect based on role
  useEffect(() => {
    if (!isLoading && user) {
      const isAdminRoute = pathname?.startsWith('/admin');
      const isClientRoute = pathname?.startsWith('/client');
      
      if (user.role === 'admin' && !isAdminRoute && pathname !== '/login') {
        router.push('/admin');
      } else if (user.role === 'client' && !isClientRoute && pathname !== '/login') {
        router.push('/client');
      }
    }
  }, [user, isLoading, pathname, router]);

  const fetchCurrentUser = async (token: string) => {
    try {
      const socket = getSocket();
      socket.emit('get-current-user', { token }, (res: any) => {
        if (res.success) {
          setUser(res.data);
        } else {
          localStorage.removeItem('token');
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      const socket = getSocket();
      socket.emit('login', { username, password }, (res: any) => {
        if (res.success) {
          localStorage.setItem('token', res.data.token);
          setUser(res.data.user);
          resolve();
        } else {
          reject(new Error(res.error));
        }
      });
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const register = async (data: RegisterData) => {
    return new Promise<void>((resolve, reject) => {
      const socket = getSocket();
      socket.emit('register', data, (res: any) => {
        if (res.success) {
          localStorage.setItem('token', res.data.token);
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
