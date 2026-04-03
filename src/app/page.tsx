'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Metadata cho trang (chỉ hoạt động với Server Component)
// Do trang này là Client Component, metadata sẽ được export riêng
export const metadata = {
  title: 'Billiard Club - Hệ thống quản lý bàn bi da chuyên nghiệp',
  description: 'Trải nghiệm không gian bi da đẳng cấp, đặt bàn online, quản lý thời gian chơi chuyên nghiệp',
  keywords: 'billiard, bi da, đặt bàn bi da, clb billiard, quản lý bàn bi da',
  authors: [{ name: 'Billiard Club' }],
  openGraph: {
    title: 'Billiard Club - Hệ thống quản lý bàn bi da',
    description: 'Trải nghiệm không gian bi da đẳng cấp nhất',
    url: 'https://billard-frontend.vercel.app',
    siteName: 'Billiard Club',
    images: [
      {
        url: 'https://images.elipsport.vn/anh-seo-tin-tuc/2021/4/15/billiard-la-gi-bida-co-may-loai-va-dac-diem-moi-loai-nhu-the-nao-3.jpg',
        width: 1200,
        height: 630,
        alt: 'Billiard Club',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  }
};

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Set title động cho client component
  useEffect(() => {
    document.title = 'Billiard Club - Hệ thống quản lý bàn bi da';
  }, []);

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
