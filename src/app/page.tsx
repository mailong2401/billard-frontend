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
      // ❌ chưa đăng nhập → về login
      router.replace('/auth/login');
    } else {
      // ✅ đã đăng nhập → vào hệ thống
      // 👉 tùy role mà redirect
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/client');
      }
    }
  }, [user, isLoading, router]);

  // loading UI
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    </div>
  );
}
