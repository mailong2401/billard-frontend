'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth/login');
    } else {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role === 'staff') {
        router.replace('/staff');
      } else {
        router.replace('/client');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex justify-center items-center h-screen bg-white dark:bg-black">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Đang kiểm tra đăng nhập...</p>
      </div>
    </div>
  );
}
