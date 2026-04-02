'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from '@/contexts/SocketContext';
import Header from '@/components/client/Header';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Kiểm tra theme từ localStorage
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-macchiato-base antialiased`}>
        <SocketProvider>
          <Header />
          {/* Main content với padding 2 bên */}
          <main className="min-h-screen px-4 md:px-8 lg:px-12 py-6 md:py-8">
            {children}
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </SocketProvider>
      </body>
    </html>
  );
}
