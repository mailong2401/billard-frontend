'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { BiUser, BiLock, BiShow, BiHide } from 'react-icons/bi';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="bg-white dark:bg-macchiato-surface rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-macchiato-text">
            Billiard Club
          </h1>
          <p className="text-gray-600 dark:text-macchiato-subtext mt-2">
            Đăng nhập để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Tên đăng nhập
            </label>
            <div className="relative">
              <BiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <BiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <BiHide className="h-5 w-5" /> : <BiShow className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-macchiato-subtext mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="text-primary-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
