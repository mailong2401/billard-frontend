'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from '@/contexts/SocketContext';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <SocketProvider>
          <AuthProvider>  {/* ← AuthProvider phải ở đây, bao bọc children */}
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
