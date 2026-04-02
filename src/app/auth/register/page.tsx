'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { BiUser, BiLock, BiEnvelope, BiUserPlus, BiPhone } from 'react-icons/bi';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="bg-white dark:bg-macchiato-surface rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🎱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-macchiato-text">
            Đăng ký
          </h1>
          <p className="text-gray-600 dark:text-macchiato-subtext text-sm mt-1">
            Tạo tài khoản mới
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Họ tên *
            </label>
            <div className="relative">
              <BiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Nhập họ tên"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Tên đăng nhập *
            </label>
            <div className="relative">
              <BiUserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Email *
            </label>
            <div className="relative">
              <BiEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <BiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Số điện thoại"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <BiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Nhập mật khẩu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <BiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-mantle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                placeholder="Xác nhận mật khẩu"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-macchiato-subtext mt-6">
          Đã có tài khoản?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
